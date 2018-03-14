import * as Subject from '../../models/subject.js';

import {
  absolute_value_sort,
  post_traversal_value_set,
  post_traversal_search_string_set,
} from './data_hierarchy_utils.js';

const create_ministry_hierarchy = function(value_attr,skip_crsos,root_id){
  return d3.hierarchy(Subject.gov,
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
}

export { create_ministry_hierarchy };