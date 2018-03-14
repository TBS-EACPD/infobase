import * as Subject from '../../models/subject.js';
import { sos } from '../../models/businessConstants.js';
import { text_maker } from '../../models/text.js';
import { Table } from '../../core/TableClass.js';

import {
  absolute_value_sort,
  get_glossary_entry,
  get_id_ancestry,
  post_traversal_search_string_set,
} from './data_hierarchy_utils.js'

const mock_model = function(id,name, description,type, extra_attrs={}){
  return Object.assign({
    id,
    description,
    name,
    is : __type__ => __type__ === type,
  }, extra_attrs);
}

const create_spend_type_hierarchy = function(value_attr,root_id){
  return d3.hierarchy(Subject.gov,
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
        node.exp = node.value = d3.sum(node.children, d=>d.value);
      }
      post_traversal_search_string_set(node);
    })
    .sort( absolute_value_sort );
}

export { create_spend_type_hierarchy };