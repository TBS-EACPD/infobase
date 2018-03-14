import * as Subject from '../../models/subject';
import { Table } from '../../core/TableClass.js';
import { text_maker } from '../../models/text';
import { rpb_link } from '../../link_utils.js';

import {
  absolute_value_sort,
  get_glossary_entry,
  get_id_ancestry,
  post_traversal_search_string_set,
} from './data_hierarchy_utils.js';

let year;

const set_year_by_presentation_scheme = (presentation_scheme) => {
  if (presentation_scheme === "est_doc_im") { 
    year = "{{est_next_year}}_estimates";
  } else {
    year = "{{est_in_year}}_estimates";
  }
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
  "3": "G_AND_C",
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
  return subject_to_vs_type_nodes_common(estimates_data);
}

const subject_to_vs_type_nodes_filtered_by_est_doc_code = (node, est_doc_code) => {
  const table8 = Table.lookup('table8');
  const estimates_data = _.chain(table8.q(node).data)
    .filter( row => row.est_doc_code === est_doc_code)
    .value();

  return estimates_data.length === 0 ? false : subject_to_vs_type_nodes_common(estimates_data);
}

const subject_to_vs_type_nodes_common = (estimates_data) => {
  const data_for_node_mapping = _.map(estimates_data, row => {
    return {
      id: row.votestattype,
      name: row.votestattype !== 999 ? text_maker("vstype"+row.votestattype) : text_maker("stat_items"),
      value: row[year],
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
  IM: "INTER_EST",
};
const get_glossary_entry_by_est_doc_code = (est_doc_code) => {
  const glossary_key = est_doc_code_to_glossary_key_dictionary[est_doc_code]
  return glossary_key ? get_glossary_entry(glossary_key) : false;
}

const est_type_node_mapping_common_options = {
  is: __type__ => __type__ === "est_type",
  plural: () => text_maker("partition_est_type_perspective"),
  glossary_entry_by_id_func: get_glossary_entry_by_est_doc_code,
};

const subject_to_est_type_nodes = (node) => {
  const table8 = Table.lookup('table8');
  const estimates_data = table8.q(node).data;

  const data_for_node_mapping = _.map(estimates_data, row => {
    return {
      id: row.est_doc_code,
      name: row.est_doc,
      value: row[year],
      data_for_children: _.omit(row, ["csv_index", "est_doc_code", "est_doc"]),
    };
  });

  return estimates_common_node_mapping(
    _.extend(
      {},
      {data_for_node_mapping}, 
      est_type_node_mapping_common_options
    )
  );
}

const est_type_or_vs_type_node_to_stat_item_nodes = (node) => {
  const data_for_node_mapping = _.chain(node.data_for_children)
    .filter( row => row.votenum === "S")
    .map( row => {
      return {
        id: row.desc,
        name: row.desc,
        value: row[year],
        data_for_children: false,
      };
    })
    .value();

  return data_for_node_mapping.length === 0 ? 
    false : 
    estimates_common_node_mapping({
      data_for_node_mapping,
      is: __type__ => __type__ === "stat_item",
      plural: () => text_maker("stat"),
      glossary_entry_by_id_func: () => false,
    });
}

const est_type_node_to_vs_type_nodes = (node) => {
  const data_for_node_mapping = _.map(node.data_for_children, row => {
    return {
      id: row.votestattype,
      name: row.votestattype !== 999 ? text_maker("vstype"+row.votestattype) : text_maker("stat_items"),
      value: row[year],
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

const orgs_with_planned_spending = () => { 
  return _.chain(Subject.Ministry.get_all())
    .map(ministry => ministry.orgs)
    .flatten()
    .filter( org => _.indexOf(org.table_ids, "table8") !== -1)
    .value();
}

const orgs_in_est_doc = (est_doc_code) => {
  const table8 = Table.lookup('table8');

  return _.chain(Subject.Ministry.get_all())
    .map(ministry => ministry.orgs)
    .flatten()
    .filter( org => _.indexOf(org.table_ids, "table8") !== -1)
    .filter( org => _.some(table8.q(org).data, row => row.est_doc_code === est_doc_code))
    .value();
}

const est_type_node_rules = (node) => {
  if (node.is("gov")){
    return subject_to_est_type_nodes(node);
  }  else if (node.is("est_type")){
    return est_type_node_to_vs_type_nodes(node);
  } else if (node.is("vs_type")){
    return est_type_or_vs_type_node_to_stat_item_nodes(node);
  }
}

const vs_type_node_rules = (node) => {
  if (node.is("gov")){
    return subject_to_vs_type_nodes(node);
  } else if (node.is("vs_type")){
    return est_type_or_vs_type_node_to_stat_item_nodes(node);
  }
}

const org_planned_spend_node_rules = (node) => {
  if (node.is("gov")){
    return orgs_with_planned_spending();
  } else if (node.is("dept")){
    return subject_to_est_type_nodes(node);
  } else if (node.is("est_type")){
    return est_type_node_to_vs_type_nodes(node);
  }
}

const specific_est_doc_node_rules = (node, est_doc_code) => {
  if (node.is("gov")){
    return orgs_in_est_doc(est_doc_code);
  } else if (node.is("dept")){
    return subject_to_vs_type_nodes_filtered_by_est_doc_code(node, est_doc_code);
  }
}

const get_rpb_subject_code_from_context = (node, presentation_scheme) => {
  if ( node.depth !== 0 && (presentation_scheme === "org_planned_spend" || presentation_scheme.startsWith("est_doc_")) ) {
    return "dept_" + ( node.data.is("dept") ?
      node.data.id :
      node.parent.data.is("dept") ?
        node.parent.data.id :
        node.parent.parent.data.id );
  } else {
    return "gov_gov";
  }
}

const planned_spending_post_traversal_rule_set = (node,value_attr,root_id,presentation_scheme) => {
  const table8 = Table.lookup('table8');
  
  const default_rpb_link_options = { 
    columns: [year],
    subject: get_rpb_subject_code_from_context(node, presentation_scheme),
    mode: "details",
    dimension: "voted_stat",
    filter: text_maker("all"),
    table: table8.id,
    preferDeptBreakout: true,
    descending: false,
  }

  node.id_ancestry = get_id_ancestry(root_id,node);

  if (node.data.is("vs_type") || node.data.is("est_type") || node.data.is("stat_item")){
    node[value_attr] = node.value = node.data.value;
    if (node.data.is("vs_type")) {
      node.data.rpb_link = rpb_link( 
        _.extend({}, default_rpb_link_options, {
          dimension: node.data.id === 999 ? "voted_stat" : "major_voted_stat",
          filter: node.data.id === 999 ? text_maker("stat") : node.data.name,
        }) 
      );
    } else if (node.data.is("est_type")) {
      node.data.rpb_link = rpb_link( _.extend({}, default_rpb_link_options, {dimension: "by_estimates_doc", filter: node.data.name}) );
    } else if (node.data.is("stat_item")) {
      node.data.rpb_link = rpb_link( _.extend({}, default_rpb_link_options, {dimension: "voted_stat", filter: text_maker("stat")}) );
    }
  } else {
    node.children = _.filter(node.children, d => d.value !== false && d.value !== 0);
    node[value_attr] = node.value = d3.sum(node.children, d => d.value);
    if (node.data.is("dept")){
      node.data.rpb_link = rpb_link(default_rpb_link_options);
    }
  }
}

const create_planned_spending_hierarchy = function(value_attr, root_id, presentation_scheme) {
  set_year_by_presentation_scheme(presentation_scheme);

  return d3.hierarchy(Subject.gov,
    node => {
      if (presentation_scheme === "est_type") {
        return est_type_node_rules(node);
      } else if (presentation_scheme === "vs_type") {
        return vs_type_node_rules(node);
      } else if (presentation_scheme === "org_planned_spend") {
        return org_planned_spend_node_rules(node);
      } else if (presentation_scheme.startsWith("est_doc_")) {
        const est_doc_code = presentation_scheme.replace("est_doc_", "").toUpperCase();
        return specific_est_doc_node_rules(node, est_doc_code);
      }
    })
    .eachAfter(node =>{
      planned_spending_post_traversal_rule_set(node,value_attr, root_id, presentation_scheme);
      post_traversal_search_string_set(node);
    })
    .sort( absolute_value_sort );
}

export { create_planned_spending_hierarchy };