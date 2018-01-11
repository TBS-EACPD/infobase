module.exports = exports;
const Subject = require("../models/subject");
const {GlossaryEntry} = require("../models/glossary");
const {Table} = require('../core/TableClass.js');
const {text_maker} = require("../models/text");
const {sos} = require('../models/businessConstants.js');
const { InstForm } = require('../models/subject.js');

const absolute_value_sort = (a,b) => - ( Math.abs(a.value) - Math.abs(b.value) );

const mock_model = exports.mock_model = function(id,name, description,type, extra_attrs={} ){
  return Object.assign({
    id,
    description,
    name,
    is : __type__ => __type__ === type,
  }, extra_attrs);
};

// a node can be uniquely identified by its full ancestry, which is saved as a property of each node for easy look-up
const get_id_ancestry = (root_id,node) => {
  if (node.parent && !_.isUndefined(node.parent.data.id)) {
    return node.data.id + '-' + get_id_ancestry(root_id,node.parent);
  } else {
    return root_id ? "root:"+root_id : "root";
  }
};

const value_functions = exports.value_functions = {
  "exp" : function(node){
    const table6 = Table.lookup('table6');
    if ( !table6.programs.has(node)){  
      return false;
    }
    return _.first(table6.programs.get(node))["{{pa_last_year}}exp"];
  },
  "fte" : function(node){
    const table12 = Table.lookup('table12');
    if ( !table12.programs.has(node)){  
      return false;
    }
    return _.first(table12.programs.get(node))["{{pa_last_year}}"];
  },
};

const post_traversal_value_set = exports.post_traversal_value_set = function(node,value_attr,root_id){
  node.id_ancestry = get_id_ancestry(root_id,node);
  if (node.data.is("program")){
    node.exp = value_functions["exp"](node.data);
    node.fte = value_functions["fte"](node.data);
    node.value = node[value_attr];
  } else if (_.isUndefined(node.children)){
    node.value = false;
  } else {
    node.children = _.filter(node.children,d=>d.value!==false && d.value !== 0);
    node.exp = d4.sum(node.children, d=>d.exp);
    node.fte = d4.sum(node.children, d=>d.fte);
    node.value = d4.sum(node.children, d=>d.value);
  }
};

const post_traversal_search_string_set = function(node){
  node.data.search_string = "";
  if (node.data.name){
    node.data.search_string += _.deburr(node.data.name.toLowerCase());
  }
  if (node.data.description){
    node.data.search_string += _.deburr(node.data.description.replace(/<(?:.|\n)*?>/gm, '').toLowerCase());
  }
};

exports.create_ministry_hierarchy = function(value_attr,skip_crsos,root_id){
  return d4.hierarchy(Subject.gov,
    node => {
      if (node.is("gov")){
        return Subject.Ministry.get_all();
      } else if (node.is("ministry")){
        return node.orgs;
      } else if (node.is("dept")){
        if (skip_crsos) {
          return  _.reduce(node.crsos, (memo, crso) => memo.concat(crso.programs), []);
        } else {
          return node.crsos;
        }
      } else if (!skip_crsos && node.is("crso")){
        return node.programs;
      } 
    })
    .eachAfter(node => {
      post_traversal_value_set(node,value_attr,root_id);
      post_traversal_search_string_set(node);
    })
    .sort( absolute_value_sort );
};

exports.create_tag_hierarchy = function(root,value_attr,root_id) {
  const hierarchy = d4.hierarchy(Subject.Tag.tag_roots[root],
    node => {
      if (node.is("tag")){
        return node.children_tags.length > 0 ? node.children_tags : node.programs;
      }
    })
    .eachAfter(node => {
      post_traversal_value_set(node,value_attr,root_id);
      post_traversal_search_string_set(node);
    })
    .sort( absolute_value_sort );
  hierarchy.exp = Table.lookup('table6').q().sum("{{pa_last_year}}exp");
  hierarchy.fte = Table.lookup('table12').q().sum("{{pa_last_year}}");
  hierarchy.value = hierarchy[value_attr]; 
  return hierarchy;
};

exports.create_spend_type_hierarchy = function(value_attr,root_id) {
  return d4.hierarchy(Subject.gov,
    node => {
      let _mock_model;
      if (node.is("gov")){
        _mock_model = function(id,name,type){
          return mock_model(
            id,
            name,
            '',
            type,
            {plural:()=> text_maker("type_of_spending")}
          );
        };
        return [
          _mock_model("op_spending", text_maker("op_spending"), "type_of_spending"),
          _mock_model("capital_spending", text_maker("capital_spending"), "type_of_spending"),
          _mock_model(sos["10"].text,sos["10"].text, "type_of_spending"),
          _mock_model(sos["11"].text,sos["11"].text, "type_of_spending"),
          _mock_model("revenues", text_maker("revenues"), "type_of_spending"),
        ];
      } else if (node.is("type_of_spending")){
        _mock_model = function(so){
          const plural = function(){ return text_maker("sos")};
          const so_num = so.so_num;
          const glossary_key = so_num < 21 ? 
            "SOBJ"+so_num :
            so_num === 21 ?
              "EXT_REV" :
              "INT_REV";
          return mock_model(
            so.text+so_num, 
            so.text,
            GlossaryEntry.lookup(glossary_key).definition,
            "so",
            {plural,so_num}
          );
        };
        const children = {
          "op_spending" : [sos["1"], sos["2"],sos["3"],sos["4"],sos["5"],sos["6"],sos["7"]],
          "capital_spending" : [sos["8"],sos["9"]],
          [sos["10"].text] : [sos["10"]], 
          [sos["11"].text] : [sos["11"]], 
          "revenues" : [sos["21"],sos["22"]],
        }[node.id];
        return _.map(children, _mock_model);
      } else if (node.is("so")){
        _mock_model = function(row){
          const unique_id = Subject.Program.unique_id(row.dept,row.activity_code); 
          const program = Subject.Program.lookup(unique_id);
          const data = Object.assign({},{value:row["{{pa_last_year}}"]});
          return mock_model(
            unique_id + row.so_num, 
            program.name + " - " + text_maker("program_slice_of", {so_name: row.so}),
            program.description,
            "program_fragment",
            { 
              dept: program.dept,
              plural: () => text_maker("program_slice"),
              program_id: unique_id,
              tags: program.tags,
              value: data.value,
            }
          );
        };
        return Table.lookup('table305').data
          .filter(row=>row.so_num===node.so_num)
          .map(_mock_model);
      }
    })
    .eachAfter(node =>{
      node.id_ancestry = get_id_ancestry(root_id,node);
      if (node.data.is("program_fragment")){
        node.exp = node.value = node.data.value;
      } else {
        node.children = _.filter(node.children,d=>d.value!==false && d.value !== 0);
        node.exp = node.value = d4.sum(node.children, d=>d.value);
      }
      post_traversal_search_string_set(node);
    })
    .sort( absolute_value_sort );
};

exports.create_org_info_hierarchy = function(value_attr,root_id) {
  return d4.hierarchy(Subject.gov,
    node => {
      if (node.is("gov")){
        return Subject.Ministry.get_all();
      } else if (node.is("ministry")){
        return _.chain(node.orgs)
          .reject("is_dead")
          .groupBy("inst_form.id")
          .map( (orgs, parent_form_id) => {
            return _.chain(orgs)
              .groupBy("inst_form.id")
              .map( (orgs, type_id) => ({
                id: type_id,
                description: "todo",
                name: InstForm.lookup(type_id).name,
                is: __type__ => __type__ === "inst_form",
                orgs: orgs,
              }) )
              .value()
          })
          .flatten()
          .value();
      } else if (node.is("inst_form")) {
        return node.orgs;
      }
    })
    .eachAfter(node =>{
      node.id_ancestry = get_id_ancestry(root_id,node);
      if (node.data.is("dept")){
        node[value_attr] = node.value = node.data.value = 1;
      } else {
        node.children = _.filter(node.children,d=>d.value!==false && d.value !== 0);
        node[value_attr] = node.value = d4.sum(node.children, d=>d.value);
      }
      post_traversal_search_string_set(node);
    })
    .sort( (a,b) => a.data.name.toLowerCase().localeCompare (b.data.name.toLowerCase() ) );
};