import { GlossaryEntry } from '../../../models/glossary';
import { Table } from '../../../core/TableClass.js';

const absolute_value_sort = (a,b) => - ( Math.abs(a.value) - Math.abs(b.value) );
const alphabetic_name_sort = (a,b) => a.data.name.toLowerCase().localeCompare( b.data.name.toLowerCase() );

const get_glossary_entry = (glossary_key) => GlossaryEntry.lookup(glossary_key) ? GlossaryEntry.lookup(glossary_key).definition : false;

const value_functions = {
  "exp" : function(node){
    const table6 = Table.lookup('table6');
    if ( !table6.programs.has(node) ){  
      return false;
    }
    return _.first(table6.programs.get(node))["{{pa_last_year}}exp"];
  },
  "fte" : function(node){
    const table12 = Table.lookup('table12');
    if ( !table12.programs.has(node) ){  
      return false;
    }
    return _.first(table12.programs.get(node))["{{pa_last_year}}"];
  },
}

const post_traversal_value_set = function(node, data_type){
  if (node.data.is("program")){
    node.exp = value_functions["exp"](node.data);
    node.fte = value_functions["fte"](node.data);
    node.value = node[data_type];
  } else if (_.isUndefined(node.children)){
    node.value = false;
  } else {
    node.children = _.filter(node.children,d => d.value !== false && d.value !== 0);
    node.exp = d3.sum(node.children, d => d.exp);
    node.fte = d3.sum(node.children, d => d.fte);
    node.value = d3.sum(node.children, d => d.value);
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

export {
  absolute_value_sort,
  alphabetic_name_sort,
  get_glossary_entry,
  post_traversal_value_set,
  post_traversal_search_string_set,
  value_functions,
};
