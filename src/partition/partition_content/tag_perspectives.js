import * as Subject from '../../models/subject.js';
import { Table } from '../../core/TableClass.js';

import {
  absolute_value_sort,
  post_traversal_value_set,
  post_traversal_search_string_set,
} from './data_hierarchy_utils.js';

const create_tag_hierarchy = function(root, value_attr, root_id) {
  const hierarchy = d3.hierarchy(Subject.Tag.tag_roots[root],
    node => {
      if (node.is("tag")){
        return node.children_tags.length > 0 ? node.children_tags : node.programs;
      }
    })
    .eachAfter(node => {
      post_traversal_value_set(node, value_attr, root_id);
      post_traversal_search_string_set(node);
    })
    .sort( absolute_value_sort );
  hierarchy.exp = Table.lookup('table6').q().sum("{{pa_last_year}}exp");
  hierarchy.fte = Table.lookup('table12').q().sum("{{pa_last_year}}");
  hierarchy.value = hierarchy[value_attr]; 
  return hierarchy;
};

export { create_tag_hierarchy };