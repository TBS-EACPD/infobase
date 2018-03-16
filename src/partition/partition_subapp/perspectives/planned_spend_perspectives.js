import * as Subject from '../../../models/subject';
import { Table } from '../../../core/TableClass.js';
import { text_maker, run_template } from '../../../models/text';
import { TextMaker } from '../../../util_components';
import { rpb_link } from '../../../link_utils.js';
import { PartitionDataWrapper } from "../../partition_diagram/PartitionDataWrapper.js";
import { PartitionPerspective } from './PartitionPerspective.js';

import {
  absolute_value_sort,
  get_glossary_entry,
  get_id_ancestry,
  post_traversal_search_string_set,
} from './data_hierarchy_utils.js';

import { 
  get_common_popup_options, 
  wrap_in_brackets, 
  formats_by_data_type,
} from './perspective_utils.js';


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
  plural: () => text_maker("partition_vote_stat_perspective"),
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
  if ( node.is("gov") ){
    return subject_to_est_type_nodes(node);
  }  else if ( node.is("est_type") ){
    return est_type_node_to_vs_type_nodes(node);
  } else if ( node.is("vs_type") ){
    return est_type_or_vs_type_node_to_stat_item_nodes(node);
  }
}

const vs_type_node_rules = (node) => {
  if ( node.is("gov") ){
    return subject_to_vs_type_nodes(node);
  } else if ( node.is("vs_type") ){
    return est_type_or_vs_type_node_to_stat_item_nodes(node);
  }
}

const org_planned_spend_node_rules = (node) => {
  if ( node.is("gov") ){
    return orgs_with_planned_spending();
  } else if ( node.is("dept") ){
    return subject_to_est_type_nodes(node);
  } else if ( node.is("est_type") ){
    return est_type_node_to_vs_type_nodes(node);
  }
}

const specific_est_doc_node_rules = (node, est_doc_code) => {
  if ( node.is("gov") ){
    return orgs_in_est_doc(est_doc_code);
  } else if ( node.is("dept") ){
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

const planned_spending_post_traversal_rule_set = (node,data_type,distinct_root_identifier,presentation_scheme) => {
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

  node.id_ancestry = get_id_ancestry(distinct_root_identifier,node);

  if ( node.data.is("vs_type") || node.data.is("est_type") || node.data.is("stat_item") ){
    node[data_type] = node.value = node.data.value;
    if ( node.data.is("vs_type") ) {
      node.data.rpb_link = rpb_link( 
        _.extend({}, default_rpb_link_options, {
          dimension: node.data.id === 999 ? "voted_stat" : "major_voted_stat",
          filter: node.data.id === 999 ? text_maker("stat") : node.data.name,
        }) 
      );
    } else if ( node.data.is("est_type") ) {
      node.data.rpb_link = rpb_link( _.extend({}, default_rpb_link_options, {dimension: "by_estimates_doc", filter: node.data.name}) );
    } else if ( node.data.is("stat_item") ) {
      node.data.rpb_link = rpb_link( _.extend({}, default_rpb_link_options, {dimension: "voted_stat", filter: text_maker("stat")}) );
    }
  } else {
    node.children = _.filter(node.children, d => d.value !== false && d.value !== 0);
    node[data_type] = node.value = d3.sum(node.children, d => d.value);
    if ( node.data.is("dept") ){
      node.data.rpb_link = rpb_link(default_rpb_link_options);
    }
  }
}

const create_planned_spending_hierarchy = function(data_type, presentation_scheme){
  const distinct_root_identifier = (new Date).getTime();
  set_year_by_presentation_scheme(presentation_scheme);

  return d3.hierarchy(Subject.gov,
    node => {
      if (presentation_scheme === "est_type") {
        return est_type_node_rules(node);
      } else if (presentation_scheme === "vs_type") {
        return vs_type_node_rules(node);
      } else if (presentation_scheme === "org_planned_spend") {
        return org_planned_spend_node_rules(node);
      } else if ( presentation_scheme.startsWith("est_doc_") ) {
        const est_doc_code = presentation_scheme.replace("est_doc_", "").toUpperCase();
        return specific_est_doc_node_rules(node, est_doc_code);
      }
    })
    .eachAfter(node =>{
      planned_spending_post_traversal_rule_set(node, data_type, distinct_root_identifier, presentation_scheme);
      post_traversal_search_string_set(node);
    })
    .sort(absolute_value_sort);
}


const planned_spending_hierarchy_factory = (presentation_scheme, apply_node_hiding_rules) => {
  const hierarchy = create_planned_spending_hierarchy("planned_exp", presentation_scheme);

  if (apply_node_hiding_rules){
    hierarchy
      .each(node => {
        node.__value__ = node.value;
        node.open = true;
        node.how_many_to_show = function(_node){
          if (_node.children.length <= 2){ return [_node.children, []]}
          const show = [_.head(_node.children)];
          const hide = _.tail(_node.children);
          const unhide = _.filter(hide, __node => __node.value > hierarchy.value/100);
          return [show.concat(unhide), _.difference(hide,unhide)];
        }
      })
      .each(node => {
        node.children = PartitionDataWrapper.__show_partial_children(node);
      });
  }

  return hierarchy;
}


const planned_exp_popup_template = function(presentation_scheme, d){
  const common_popup_options = _.assign(
    {}, 
    get_common_popup_options(d),
    {
      year: presentation_scheme === "est_doc_im" ? run_template("{{est_next_year}}") : run_template("{{est_in_year}}"),
      planned_exp: d.value,
      planned_exp_is_negative: d.value < 0,
      rpb_link: d.data.rpb_link,
    }
  );
  if (d.data.is("stat_item")) {
    return text_maker("partition_planned_vs_type_or_est_type", 
      _.extend(common_popup_options, {
        description: d.data.description,
        dept_name: d.parent.data.name,
        dept_id: d.parent.data.id,
      })
    );
  } else if ( d.data.is("vs_type") || d.data.is("est_type") ) {
    let dept_name, dept_id;
    if (presentation_scheme === "org_planned_spend") {
      if (d.data.is("vs_type")) {
        dept_name = d.parent.parent.data.name;
        dept_id = d.parent.parent.data.id;
      } else if (d.data.is("est_type")) {
        dept_name = d.parent.data.name;
        dept_id = d.parent.data.id;
      }
    }
    return text_maker("partition_planned_vs_type_or_est_type", 
      _.extend(common_popup_options, {
        description: d.data.description,
        show_parent_dept_name: presentation_scheme === "org_planned_spend",
        dept_name,
        dept_id,
      })
    );
  } else if (d.data.is("dept")) {
    return text_maker("partition_planned_spending_org_popup", 
      _.extend(common_popup_options, {
        description: d.data.mandate,
      })
    );
  }
}

const get_name = (presentation_scheme) => {
  switch (presentation_scheme){
    case "org_planned_spend" : return text_maker("orgs");
    case "est_type" : return text_maker("partition_est_type_perspective");
    case "vs_type" : return text_maker("partition_vote_stat_perspective");
    case "est_doc_mains" : return text_maker("est_doc_mains");
    case "est_doc_sea" : return text_maker("est_doc_sea");
    case "est_doc_seb" : return text_maker("est_doc_seb");
    case "est_doc_sec" : return text_maker("est_doc_sec");
    case "est_doc_im" : return text_maker("est_doc_im" );
  }
}

const get_root_text_key = (presentation_scheme) => {
  switch (presentation_scheme){
    case "est_doc_mains" : return "partition_spending_will_be_by_mains";
    case "est_doc_sea" : return "partition_spending_will_be_by_sea";
    case "est_doc_seb" : return "partition_spending_will_be_by_seb";
    case "est_doc_sec" : return "partition_spending_will_be_by_sec";
    case "est_doc_im" : return "partition_spending_will_be_by_im";
    default : return "partition_spending_will_be";
  }
}

const planned_exp_perspective_factory = (presentation_scheme) => new PartitionPerspective({
  id: presentation_scheme,
  name: get_name(presentation_scheme),
  data_type: "planned_exp",
  formater: node_data => wrap_in_brackets(formats_by_data_type["planned_exp"](node_data["planned_exp"])),
  hierarchy_factory: _.curry(planned_spending_hierarchy_factory)(presentation_scheme),
  popup_template: _.curry(planned_exp_popup_template)(presentation_scheme),
  root_text_func: root_value => text_maker(get_root_text_key(presentation_scheme), {x: root_value}),
  diagram_note_content: presentation_scheme === "est_doc_im" ? <TextMaker text_key={"partition_interim_estimates_def"} /> : false,
})


const make_planned_spend_est_type_perspective = () => planned_exp_perspective_factory("est_type");
const make_planned_spend_vs_type_perspective = () => planned_exp_perspective_factory("vs_type");
const make_planned_spend_org_planned_spend_perspective = () => planned_exp_perspective_factory("org_planned_spend");
const make_planned_spend_est_doc_mains_perspective = () => planned_exp_perspective_factory("est_doc_mains");
const make_planned_spend_est_doc_sea_perspective = () => planned_exp_perspective_factory("est_doc_sea");
const make_planned_spend_est_doc_seb_perspective = () => planned_exp_perspective_factory("est_doc_seb");
const make_planned_spend_est_doc_sec_perspective = () => planned_exp_perspective_factory("est_doc_sec");
const make_planned_spend_est_doc_im_perspective = () => planned_exp_perspective_factory("est_doc_im");

export {
  make_planned_spend_est_type_perspective,
  make_planned_spend_vs_type_perspective,
  make_planned_spend_org_planned_spend_perspective,
  make_planned_spend_est_doc_mains_perspective,
  make_planned_spend_est_doc_sea_perspective,
  make_planned_spend_est_doc_seb_perspective,
  make_planned_spend_est_doc_sec_perspective,
  make_planned_spend_est_doc_im_perspective,
};