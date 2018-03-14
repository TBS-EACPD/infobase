import * as Subject from '../../models/subject';
import { InstForm } from '../../models/subject.js';
import { text_maker } from '../../models/text';

import {
  absolute_value_sort,
  alphabetic_name_sort,
  get_glossary_entry,
  get_id_ancestry,
  post_traversal_search_string_set,
} from './data_hierarchy_utils';

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
    node[value_attr] = node.value = d3.sum(node.children, d=>d.value);
  }
}

const create_org_info_ministry_hierarchy = function(value_attr,root_id) {
  return d3.hierarchy(Subject.gov,
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
        return alphabetic_name_sort(a,b);
      } else {
        return absolute_value_sort(a,b);
      }
    });
}

const create_org_info_inst_form_hierarchy = function(value_attr, root_id, grand_parent_inst_form_group) {
  return d3.hierarchy(Subject.gov,
    node => {
      if ( node.is("gov") ) {
        const orgs = _.chain( Subject.Ministry.get_all() )
          .map(ministry => ministry.orgs)
          .flatten()
          .filter(org => org.inst_form.parent_form.parent_form.id === grand_parent_inst_form_group)
          .value();
        return orgs_to_inst_form_nodes(orgs);
      } else if ( node.is("inst_form") ) {
        return node.orgs;
      }
    })
    .eachAfter(node => {
      org_info_post_traversal_rule_set(node, value_attr, root_id);
      post_traversal_search_string_set(node);
    })
    .sort( (a, b) => {
      if ( a.data.is("dept") ) {
        return alphabetic_name_sort(a, b);
      } else {
        return absolute_value_sort(a, b);
      }
    });
}

export { create_org_info_ministry_hierarchy, create_org_info_inst_form_hierarchy };