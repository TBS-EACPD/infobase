module.exports = exports;
const Subject = require("../models/subject");
const {GlossaryEntry} = require("../models/glossary");
const {Table} = require('../core/TableClass.js');
const {text_maker} = require("../models/text");
const {sos} = require('../models/businessConstants.js');
const {InstForm}  = require('../models/subject.js');
const {rpb_link}  = require('../link_utils.js');

const absolute_value_sort = (a,b) => - ( Math.abs(a.value) - Math.abs(b.value) );
const alphabetic_name_Sort = (a,b) => a.data.name.toLowerCase().localeCompare( b.data.name.toLowerCase() );

const get_glossary_entry = (glossary_key) => GlossaryEntry.lookup(glossary_key) ? GlossaryEntry.lookup(glossary_key).definition : false;

const mock_model = exports.mock_model = function(id,name, description,type, extra_attrs={} ){
  return Object.assign({
    id,
    description,
    name,
    is : __type__ => __type__ === type,
  }, extra_attrs);
}

// a node can be uniquely identified by its full ancestry, which is saved as a property of each node for easy look-up
const get_id_ancestry = (root_id,node) => {
  if (node.parent && !_.isUndefined(node.parent.data.id)) {
    return node.data.id + '-' + get_id_ancestry(root_id,node.parent);
  } else {
    return root_id ? "root:"+root_id : "root";
  }
}

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
}

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
}

const post_traversal_search_string_set = function(node){
  node.data.search_string = "";
  if (node.data.name){
    node.data.search_string += _.deburr(node.data.name.toLowerCase());
  }
  if (node.data.description){
    node.data.search_string += _.deburr(node.data.description.replace(/<(?:.|\n)*?>/gm, '').toLowerCase());
  }
}

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
            get_glossary_entry(glossary_key),
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
}


const glossary_entry_from_inst_form_type_id = (type_id) => {
  const type_id_to_glossary_suffix_map = {
    "agents_parl": "APARL",
    "crown_corp": "CC",
    "dept_agency": "STATOA",
    "dept_corp": "DEPTCORP",
    "inter_org": "IO",
    "joint_enterprise": "JE",
    "min_dept": "DEPT",
    "parl_ent": "todo",
    "serv_agency": "SA",
    "shared_gov_corp": "SGC",
    "spec_op_agency": "SOA",
  }
  const glossary_key = type_id === "parl_ent" ?
    "PARL_ORG" :
    "IFORM_"+type_id_to_glossary_suffix_map[type_id];
  return get_glossary_entry(glossary_key);
}

const orgs_to_inst_form_nodes = (orgs) => {
  return _.chain(orgs)
    .reject("is_dead")
    .groupBy("inst_form.id")
    .map( (orgs, parent_form_id) => {
      return _.chain(orgs)
        .groupBy("inst_form.id")
        .map( (orgs, type_id) => ({
          id: type_id,
          description: glossary_entry_from_inst_form_type_id(type_id),
          name: InstForm.lookup(type_id).name,
          is: __type__ => __type__ === "inst_form",
          plural: ()=> text_maker("type"),
          orgs: orgs,
        }) )
        .value()
    })
    .flatten()
    .value();
}

const org_info_post_traversal_rule_set = (node,value_attr,root_id) => {
  node.id_ancestry = get_id_ancestry(root_id,node);
  if (node.data.is("dept")){
    node[value_attr] = node.value = node.data.value = 1;
  } else {
    node.children = _.filter(node.children,d=>d.value!==false && d.value !== 0);
    node[value_attr] = node.value = d4.sum(node.children, d=>d.value);
  }
}

exports.create_org_info_ministry_hierarchy = function(value_attr,root_id) {
  return d4.hierarchy(Subject.gov,
    node => {
      if (node.is("gov")) {
        return Subject.Ministry.get_all();
      } else if (node.is("ministry")) {
        return orgs_to_inst_form_nodes(node.orgs);
      } else if (node.is("inst_form")) {
        return node.orgs;
      }
    })
    .eachAfter(node =>{
      org_info_post_traversal_rule_set(node,value_attr,root_id);
      post_traversal_search_string_set(node);
    })
    .sort( (a,b) => {
      if (a.data.is("dept")) {
        return alphabetic_name_Sort(a,b);
      } else {
        return absolute_value_sort(a,b);
      }
    });
}

exports.create_org_info_inst_form_hierarchy = function(value_attr,root_id,grand_parent_inst_form_group) {
  return d4.hierarchy(Subject.gov,
    node => {
      if (node.is("gov")) {
        const orgs = _.chain(Subject.Ministry.get_all())
          .map(ministry => ministry.orgs)
          .flatten()
          .filter(org => org.inst_form.parent_form.parent_form.id === grand_parent_inst_form_group)
          .value();
        return orgs_to_inst_form_nodes(orgs);
      } else if (node.is("inst_form")) {
        return node.orgs;
      }
    })
    .eachAfter(node =>{
      org_info_post_traversal_rule_set(node,value_attr,root_id);
      post_traversal_search_string_set(node);
    })
    .sort( (a,b) => {
      if (a.data.is("dept")) {
        return alphabetic_name_Sort(a,b);
      } else {
        return absolute_value_sort(a,b);
      }
    });
}


const estimates_common_node_mapping = ({data_for_node_mapping, is, plural, glossary_entry_by_id_func}) => {
  return _.chain(data_for_node_mapping)
    .groupBy("id")
    .map( grouped_rows => {
      const first_row = grouped_rows[0];
      const value_sum = _.reduce(grouped_rows, (sum, row) => sum + row.value, 0); 
      const data_for_children = _.chain(grouped_rows)
        .map(row => row.data_for_children)
        .filter(data => data)
        .value();

      return {
        id: first_row.id,
        name: first_row.name,
        description: glossary_entry_by_id_func(first_row.id),
        value: value_sum,
        is,
        plural,
        data_for_children,
      }
    })
    .filter( node => node.value !== 0)
    .value();
}

const vs_type_to_glossary_key_dictionary = {
  "1": "OP",
  "2": "CAP",
  "3": "G&C",
  "4": false, // Debt Forgiveness
  "5": "PAY_CC",
  "6": "TB",
  "9": false, // Other
  "999": "STAT",
};
const get_glossary_entry_by_vs_type = (vs_type) => {
  const glossary_key = vs_type_to_glossary_key_dictionary[vs_type]
  return glossary_key ? get_glossary_entry(glossary_key) : false;
}

const vs_type_node_mapping_common_options = {
  is: __type__ => __type__ === "vs_type",
  plural: () => text_maker("partition_vote_state_perspective"),
  glossary_entry_by_id_func: get_glossary_entry_by_vs_type,
};

const subject_to_vs_type_nodes = (node) => {
  const table8 = Table.lookup('table8');
  const estimates_data = table8.q(node).data;

  const data_for_node_mapping = _.map(estimates_data, row => {
    return {
      id: row.votestattype,
      name: row.votestattype !== 999 ? text_maker("vstype"+row.votestattype) : text_maker("stat_items"),
      value: row["{{est_in_year}}_estimates"],
      data_for_children: _.omit(row, ["csv_index", "votestattype", "votestattype"]),
    }
  });

  return estimates_common_node_mapping(
    _.extend(
      {},
      {data_for_node_mapping}, 
      vs_type_node_mapping_common_options
    )
  );
}

const est_doc_code_to_glossary_key_dictionary = {
  MAINS: "MAINS",
  MYA: "MYA",
  VA: "VOTED",
  SA: "ADJUS",
  SEA: "SUPPSA",
  SEB: "SUPPSB",
  SEC: "SUPPSC",
};
const get_glossary_entry_by_est_doc_code = (est_doc_code) => {
  const glossary_key = est_doc_code_to_glossary_key_dictionary[est_doc_code]
  return glossary_key ? get_glossary_entry(glossary_key) : false;
}

const est_inst_node_mapping_common_options = {
  is: __type__ => __type__ === "est_inst",
  plural: () => text_maker("partition_est_inst_perspective"),
  glossary_entry_by_id_func: get_glossary_entry_by_est_doc_code,
};

const subject_to_est_inst_nodes = (node) => {
  const table8 = Table.lookup('table8');
  const estimates_data = table8.q(node).data;

  const data_for_node_mapping = _.map(estimates_data, row => {
    return {
      id: row.est_doc_code,
      name: row.est_doc,
      value: row["{{est_in_year}}_estimates"],
      data_for_children: _.omit(row, ["csv_index", "est_doc_code", "est_doc"]),
    };
  });

  return estimates_common_node_mapping(
    _.extend(
      {},
      {data_for_node_mapping}, 
      est_inst_node_mapping_common_options
    )
  );
}

const vote_node_mapping_common_options = {
  is: __type__ => __type__ === "vote",
  plural: () => text_maker("votestat_item"),
  glossary_entry_by_id_func: () => false,
};

const est_inst_or_vs_type_node_to_vote_nodes = (node) => {
  const data_for_node_mapping = _.map(node.data_for_children, row => {
    return {
      id: row.votenum === "S" ? 
        row.desc :
        row.votenum,
      name: row.votenum === "S" ? 
        text_maker("stat") + ": " + row.desc :
        row.desc,
      value: row["{{est_in_year}}_estimates"],
      data_for_children: false,
    };
  });

  return estimates_common_node_mapping(
    _.extend(
      {},
      {data_for_node_mapping}, 
      vote_node_mapping_common_options
    )
  );
}

const est_inst_node_to_vs_type_nodes = (node) => {
  const data_for_node_mapping = _.map(node.data_for_children, row => {
    return {
      id: row.votestattype,
      name: row.votestattype !== 999 ? text_maker("vstype"+row.votestattype) : text_maker("stat_items"),
      value: row["{{est_in_year}}_estimates"],
      data_for_children: _.omit(row, ["csv_index", "est_doc_code", "est_doc"]),
    };
  });

  return estimates_common_node_mapping(
    _.extend(
      {},
      {data_for_node_mapping}, 
      vs_type_node_mapping_common_options
    )
  );
}

const est_inst_node_rules = (node) => {
  if (node.is("gov")){
    return subject_to_est_inst_nodes(node);
  }  else if (node.is("est_inst")){
    return est_inst_node_to_vs_type_nodes(node);
  } else if (node.is("vs_type")){
    return est_inst_or_vs_type_node_to_vote_nodes(node);
  }
}

const vs_type_node_rules = (node) => {
  if (node.is("gov")){
    return subject_to_vs_type_nodes(node);
  } else if (node.is("vs_type")){
    return est_inst_or_vs_type_node_to_vote_nodes(node);
  }
}

const orgs_with_planned_spending = () => { 
  return _.chain(Subject.Ministry.get_all())
    .map(ministry => ministry.orgs)
    .flatten()
    .filter( org => _.indexOf(org.table_ids, "table8") !== -1)
    .value();
}

const org_planned_spend_node_rules = (node) => {
  if (node.is("gov")){
    return orgs_with_planned_spending();
  } else if (node.is("dept")){
    return subject_to_est_inst_nodes(node);
  } else if (node.is("est_inst")){
    return est_inst_node_to_vs_type_nodes(node);
  }
}

const planned_spending_post_traversal_rule_set = (node,value_attr,root_id) => {
  const table8 = Table.lookup('table8');

  node.id_ancestry = get_id_ancestry(root_id,node);
  if (node.data.is("vs_type") || node.data.is("est_inst") || node.data.is("vote")){
    node[value_attr] = node.value = node.data.value;
    node.data.rpb_link = rpb_link({ table: table8.id });
  } else {
    node.children = _.filter(node.children, d => d.value !== false && d.value !== 0);
    node[value_attr] = node.value = d4.sum(node.children, d=>d.value);
  }
}

exports.create_planned_spending_hierarchy = function(value_attr,root_id,presentation_scheme) {
  return d4.hierarchy(Subject.gov,
    node => {
      if (presentation_scheme === "est_inst") {
        return est_inst_node_rules(node);
      } else if (presentation_scheme === "vs_type") {
        return vs_type_node_rules(node);
      } else if (presentation_scheme === "org_planned_spend") {
        return org_planned_spend_node_rules(node);
      }
    })
    .eachAfter(node =>{
      planned_spending_post_traversal_rule_set(node,value_attr,root_id);
      post_traversal_search_string_set(node);
    })
    .sort( absolute_value_sort );
}