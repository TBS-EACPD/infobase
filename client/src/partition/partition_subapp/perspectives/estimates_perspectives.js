import { sum } from "d3-array";
import { hierarchy } from "d3-hierarchy";
import _ from "lodash";
import React from "react";

import { TextMaker as StandardTextMaker } from "../../../components/index.js";
import { Table } from "../../../core/TableClass.js";
import { rpb_link } from "../../../link_utils.js";
import { Subject } from "../../../models/subject";

import { run_template } from "../../../models/text.js";
import { text_maker } from "../partition_text_provider.js";

import {
  absolute_value_sort,
  get_glossary_entry,
  post_traversal_search_string_set,
} from "./data_hierarchy_utils.js";
import { PartitionPerspective } from "./PartitionPerspective.js";

import {
  get_common_popup_options,
  wrap_in_brackets,
  formats_by_data_type,
} from "./perspective_utils.js";

const TextMaker = (props) => (
  <StandardTextMaker text_maker_func={text_maker} {...props} />
);

let year;

const get_year = (presentation_scheme) => {
  switch (presentation_scheme) {
    case "est_doc_mains":
    case "est_doc_sea":
    case "est_doc_seb":
    case "est_doc_sec":
    case "est_type":
    case "vs_type":
    case "org_estimates":
      return "{{est_in_year}}";
    default:
      return "{{est_last_year}}";
  }
};

const year_text_fragment = (presentation_scheme) => {
  return `(${run_template(get_year(presentation_scheme))})`;
};

const get_name_text_fragment = (presentation_scheme) => {
  switch (presentation_scheme) {
    case "org_estimates":
      return text_maker("orgs");
    case "est_type":
      return text_maker("partition_est_type_perspective");
    case "vs_type":
      return text_maker("partition_vote_stat_perspective");
    case "est_doc_mains":
      return text_maker("est_doc_mains");
    case "est_doc_sea":
      return text_maker("est_doc_sea");
    case "est_doc_seb":
      return text_maker("est_doc_seb");
    case "est_doc_sec":
      return text_maker("est_doc_sec");
    case "est_doc_ie":
      return text_maker("est_doc_ie");
  }
};

const set_year_by_presentation_scheme = (presentation_scheme) => {
  year = get_year(presentation_scheme) + "_estimates";
};

const estimates_common_node_mapping = ({
  data_for_node_mapping,
  is,
  glossary_entry_by_id_func,
}) => {
  return _.chain(data_for_node_mapping)
    .groupBy("id")
    .map((grouped_rows) => {
      const first_row = grouped_rows[0];
      const value_sum = _.reduce(
        grouped_rows,
        (sum, row) => sum + row.value,
        0
      );
      const data_for_children = _.chain(grouped_rows)
        .map((row) => row.data_for_children)
        .filter((data) => data)
        .value();

      return {
        id: first_row.id,
        name: first_row.name,
        description: glossary_entry_by_id_func(first_row.id),
        value: value_sum,
        is,
        data_for_children,
      };
    })
    .filter((node) => node.value !== 0)
    .value();
};

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
  const glossary_key = vs_type_to_glossary_key_dictionary[vs_type];
  return glossary_key ? get_glossary_entry(glossary_key) : false;
};

const vs_type_node_mapping_common_options = {
  is: (__type__) => __type__ === "vs_type",
  glossary_entry_by_id_func: get_glossary_entry_by_vs_type,
};

const subject_to_vs_type_nodes_common = (estimates_data) => {
  const data_for_node_mapping = _.map(estimates_data, (row) => {
    return {
      id: row.votestattype,
      name:
        row.votestattype !== 999
          ? text_maker("vstype" + row.votestattype)
          : text_maker("stat_items"),
      value: row[year],
      data_for_children: _.omit(row, [
        "csv_index",
        "votestattype",
        "votestattype",
      ]),
    };
  });

  return estimates_common_node_mapping(
    _.extend({}, { data_for_node_mapping }, vs_type_node_mapping_common_options)
  );
};

const subject_to_vs_type_nodes = (node) => {
  const orgVoteStatEstimates = Table.lookup("orgVoteStatEstimates");
  const estimates_data = orgVoteStatEstimates.q(node).data;
  return subject_to_vs_type_nodes_common(estimates_data);
};

const subject_to_vs_type_nodes_filtered_by_est_doc_code = (
  node,
  est_doc_code
) => {
  const orgVoteStatEstimates = Table.lookup("orgVoteStatEstimates");
  const estimates_data = _.chain(orgVoteStatEstimates.q(node).data)
    .filter((row) => row.est_doc_code === est_doc_code)
    .value();

  return estimates_data.length === 0
    ? false
    : subject_to_vs_type_nodes_common(estimates_data);
};

const est_doc_code_to_glossary_key_dictionary = {
  MAINS: "MAINS",
  MYA: "MYA",
  VA: "VOTED",
  SA: "ADJUS",
  SEA: "SUPPSA",
  SEB: "SUPPSB",
  SEC: "SUPPSC",
  IE: "INTER_EST",
};
const get_glossary_entry_by_est_doc_code = (est_doc_code) => {
  const glossary_key = est_doc_code_to_glossary_key_dictionary[est_doc_code];
  return glossary_key ? get_glossary_entry(glossary_key) : false;
};

const est_type_node_mapping_common_options = {
  is: (__type__) => __type__ === "est_type",
  glossary_entry_by_id_func: get_glossary_entry_by_est_doc_code,
};

const subject_to_est_type_nodes = (node) => {
  const orgVoteStatEstimates = Table.lookup("orgVoteStatEstimates");
  const estimates_data = orgVoteStatEstimates.q(node).data;

  const data_for_node_mapping = _.map(estimates_data, (row) => {
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
      { data_for_node_mapping },
      est_type_node_mapping_common_options
    )
  );
};

const est_type_or_vs_type_node_to_stat_item_nodes = (node) => {
  const data_for_node_mapping = _.chain(node.data_for_children)
    .filter((row) => row.votenum === "S")
    .map((row) => {
      return {
        id: row.desc,
        name: row.desc,
        value: row[year],
        data_for_children: false,
      };
    })
    .value();

  return data_for_node_mapping.length === 0
    ? false
    : estimates_common_node_mapping({
        data_for_node_mapping,
        is: (__type__) => __type__ === "stat_item",
        glossary_entry_by_id_func: () => false,
      });
};

const est_type_node_to_vs_type_nodes = (node) => {
  const data_for_node_mapping = _.map(node.data_for_children, (row) => {
    return {
      id: row.votestattype,
      name:
        row.votestattype !== 999
          ? text_maker("vstype" + row.votestattype)
          : text_maker("stat_items"),
      value: row[year],
      data_for_children: _.omit(row, ["csv_index", "est_doc_code", "est_doc"]),
    };
  });

  return estimates_common_node_mapping(
    _.extend({}, { data_for_node_mapping }, vs_type_node_mapping_common_options)
  );
};

const orgs_with_estimates = () => {
  return _.chain(Subject.Ministry.get_all())
    .map((ministry) => ministry.orgs)
    .flatten()
    .filter((org) => _.indexOf(org.table_ids, "orgVoteStatEstimates") !== -1)
    .value();
};

const orgs_in_est_doc = (est_doc_code) => {
  const orgVoteStatEstimates = Table.lookup("orgVoteStatEstimates");

  return _.chain(Subject.Ministry.get_all())
    .map((ministry) => ministry.orgs)
    .flatten()
    .filter((org) => _.indexOf(org.table_ids, "orgVoteStatEstimates") !== -1)
    .filter((org) =>
      _.some(
        orgVoteStatEstimates.q(org).data,
        (row) => row.est_doc_code === est_doc_code
      )
    )
    .value();
};

const est_type_node_rules = (node) => {
  if (node.is("gov")) {
    return subject_to_est_type_nodes(node);
  } else if (node.is("est_type")) {
    return est_type_node_to_vs_type_nodes(node);
  } else if (node.is("vs_type")) {
    return est_type_or_vs_type_node_to_stat_item_nodes(node);
  }
};

const vs_type_node_rules = (node) => {
  if (node.is("gov")) {
    return subject_to_vs_type_nodes(node);
  } else if (node.is("vs_type")) {
    return est_type_or_vs_type_node_to_stat_item_nodes(node);
  }
};

const org_estimates_node_rules = (node) => {
  if (node.is("gov")) {
    return orgs_with_estimates();
  } else if (node.is("dept")) {
    return subject_to_est_type_nodes(node);
  } else if (node.is("est_type")) {
    return est_type_node_to_vs_type_nodes(node);
  }
};

const specific_est_doc_node_rules = (node, est_doc_code) => {
  if (node.is("gov")) {
    return orgs_in_est_doc(est_doc_code);
  } else if (node.is("dept")) {
    return subject_to_vs_type_nodes_filtered_by_est_doc_code(
      node,
      est_doc_code
    );
  }
};

const get_rpb_subject_code_from_context = (node, presentation_scheme) => {
  if (
    node.depth !== 0 &&
    (presentation_scheme === "org_estimates" ||
      presentation_scheme.startsWith("est_doc_"))
  ) {
    return (
      "dept_" +
      (node.data.is("dept")
        ? node.data.id
        : node.parent.data.is("dept")
        ? node.parent.data.id
        : node.parent.parent.data.id)
    );
  } else {
    return "gov_gov";
  }
};

const estimates_post_traversal_rule_set = (
  node,
  data_type,
  presentation_scheme
) => {
  const orgVoteStatEstimates = Table.lookup("orgVoteStatEstimates");

  const default_rpb_link_options = {
    columns: [year],
    subject: get_rpb_subject_code_from_context(node, presentation_scheme),
    dimension: "voted_stat",
    filter: text_maker("all"),
    table: orgVoteStatEstimates.id,
    descending: false,
  };

  if (
    node.data.is("vs_type") ||
    node.data.is("est_type") ||
    node.data.is("stat_item")
  ) {
    node[data_type] = node.value = node.data.value;
    if (node.data.is("vs_type")) {
      node.data.rpb_link = rpb_link(
        _.extend({}, default_rpb_link_options, {
          dimension: "voted_stat",
          filter: node.data.id === 999 ? text_maker("stat") : node.data.name,
        })
      );
    } else if (node.data.is("est_type")) {
      node.data.rpb_link = rpb_link(
        _.extend({}, default_rpb_link_options, {
          dimension: "by_estimates_doc",
          filter: node.data.name,
        })
      );
    } else if (node.data.is("stat_item")) {
      node.data.rpb_link = rpb_link(
        _.extend({}, default_rpb_link_options, {
          dimension: "voted_stat",
          filter: text_maker("stat"),
        })
      );
    }
  } else {
    node.children = _.filter(
      node.children,
      (d) => d.value !== false && d.value !== 0
    );
    node[data_type] = node.value = sum(node.children, (d) => d.value);
    if (node.data.is("dept")) {
      node.data.rpb_link = rpb_link(default_rpb_link_options);
    }
  }
};

const create_estimates_hierarchy = function (data_type, presentation_scheme) {
  set_year_by_presentation_scheme(presentation_scheme);

  return hierarchy(Subject.gov, (node) => {
    if (presentation_scheme === "est_type") {
      return est_type_node_rules(node);
    } else if (presentation_scheme === "vs_type") {
      return vs_type_node_rules(node);
    } else if (presentation_scheme === "org_estimates") {
      return org_estimates_node_rules(node);
    } else if (presentation_scheme.startsWith("est_doc_")) {
      const est_doc_code = presentation_scheme
        .replace("est_doc_", "")
        .toUpperCase();
      return specific_est_doc_node_rules(node, est_doc_code);
    }
  })
    .eachAfter((node) => {
      estimates_post_traversal_rule_set(node, data_type, presentation_scheme);
      post_traversal_search_string_set(node);
    })
    .sort(absolute_value_sort);
};

const estimates_popup_template = function (presentation_scheme, d) {
  const common_popup_options = {
    ...get_common_popup_options(d),
    year: run_template(get_year(presentation_scheme)),
    estimates: d.value,
    estimates_is_negative: d.value < 0,
    rpb_link: d.data.rpb_link,
  };
  if (d.data.is("stat_item")) {
    return text_maker(
      "partition_estimates_vs_type_or_est_type",
      _.extend(common_popup_options, {
        description: d.data.description,
        dept_name: d.parent.data.name,
        dept_id: d.parent.data.id,
      })
    );
  } else if (d.data.is("vs_type") || d.data.is("est_type")) {
    let dept_name, dept_id;
    if (presentation_scheme === "org_estimates") {
      if (d.data.is("vs_type")) {
        dept_name = d.parent.parent.data.name;
        dept_id = d.parent.parent.data.id;
      } else if (d.data.is("est_type")) {
        dept_name = d.parent.data.name;
        dept_id = d.parent.data.id;
      }
    }
    return text_maker(
      "partition_estimates_vs_type_or_est_type",
      _.extend(common_popup_options, {
        description: d.data.description,
        show_parent_dept_name: presentation_scheme === "org_estimates",
        dept_name,
        dept_id,
      })
    );
  } else if (d.data.is("dept")) {
    return text_maker(
      "partition_estimates_spending_org_popup",
      _.extend(common_popup_options, {
        description: d.data.mandate,
      })
    );
  }
};

const get_name = (presentation_scheme) => {
  return (
    get_name_text_fragment(presentation_scheme) +
    " " +
    year_text_fragment(presentation_scheme)
  );
};

const get_lang_specific_filter_name = (presentation_scheme) => {
  switch (presentation_scheme) {
    case "est_doc_mains":
      return text_maker("est_doc_mains");
    case "est_doc_sea":
      return text_maker("est_doc_sea");
    case "est_doc_seb":
      return text_maker("est_doc_seb");
    case "est_doc_sec":
      return text_maker("est_doc_sec");
    case "est_doc_ie":
      return text_maker("est_doc_ie");
    default:
      return "";
  }
};

const get_rpb_filter = (presentation_scheme) => {
  const rpb_filter_name = get_lang_specific_filter_name(presentation_scheme);
  return !_.isEmpty(rpb_filter_name)
    ? `~filter~'${rpb_filter_name}`
    : rpb_filter_name;
};

const get_level_headers = (presentation_scheme) => {
  switch (presentation_scheme) {
    case "org_estimates":
      return {
        "1": text_maker("org"),
        "2": text_maker("partition_est_type_perspective"),
        "3": text_maker("partition_vote_stat_perspective"),
      };
    case "est_type":
      return {
        "1": text_maker("partition_est_type_perspective"),
        "2": text_maker("partition_vote_stat_perspective"),
        "3": _.startCase(text_maker("stat")),
      };
    case "vs_type":
      return {
        "1": text_maker("partition_vote_stat_perspective"),
        "2": _.startCase(text_maker("stat")),
      };
    default:
      return {
        "1": text_maker("org"),
        "2": text_maker("partition_vote_stat_perspective"),
      };
  }
};

const get_root_text_key = (presentation_scheme) => {
  switch (presentation_scheme) {
    case "est_doc_mains":
      return "partition_spending_will_be_by_est_doc";
    case "est_doc_sea":
      return "partition_spending_will_be_by_est_doc";
    case "est_doc_seb":
      return "partition_spending_will_be_by_est_doc";
    case "est_doc_sec":
      return "partition_spending_will_be_by_est_doc";
    case "est_doc_ie":
      return "partition_spending_will_be_by_est_doc";
    default:
      return "partition_spending_will_be_variable_year";
  }
};

const estimates_perspective_factory = (presentation_scheme) =>
  new PartitionPerspective({
    id: presentation_scheme,
    name: get_name(presentation_scheme),
    data_type: "estimates",
    formatter: (node_data) =>
      wrap_in_brackets(
        formats_by_data_type["estimates"](node_data["estimates"])
      ),
    hierarchy_factory: () =>
      create_estimates_hierarchy("estimates", presentation_scheme),
    popup_template: _.curry(estimates_popup_template)(presentation_scheme),
    root_text_func: (root_value) =>
      text_maker(get_root_text_key(presentation_scheme), {
        x: root_value,
        name: get_name_text_fragment(presentation_scheme),
        year: get_year(presentation_scheme),
        clean_year: get_year(presentation_scheme).replace(/(\{)|(\})/g, ""),
        past_tense: !/est_in_year/.test(get_year(presentation_scheme)),
        rpb_filter: get_rpb_filter(presentation_scheme),
      }),
    level_headers: get_level_headers(presentation_scheme),
    diagram_note_content:
      presentation_scheme === "est_doc_ie" ? (
        <TextMaker text_key={"partition_interim_estimates_def"} />
      ) : (
        false
      ),
  });

const make_estimates_est_doc_mains_perspective = () =>
  estimates_perspective_factory("est_doc_mains");
const make_estimates_est_doc_sea_perspective = () =>
  estimates_perspective_factory("est_doc_sea");
const make_estimates_est_doc_seb_perspective = () =>
  estimates_perspective_factory("est_doc_seb");
const make_estimates_est_doc_sec_perspective = () =>
  estimates_perspective_factory("est_doc_sec");
const make_estimates_est_doc_im_perspective = () =>
  estimates_perspective_factory("est_doc_ie");
const make_estimates_est_type_perspective = () =>
  estimates_perspective_factory("est_type");
const make_estimates_vs_type_perspective = () =>
  estimates_perspective_factory("vs_type");
const make_estimates_org_estimates_perspective = () =>
  estimates_perspective_factory("org_estimates");

export {
  make_estimates_est_doc_mains_perspective,
  make_estimates_est_doc_sea_perspective,
  make_estimates_est_doc_seb_perspective,
  make_estimates_est_doc_sec_perspective,
  make_estimates_est_doc_im_perspective,
  make_estimates_est_type_perspective,
  make_estimates_vs_type_perspective,
  make_estimates_org_estimates_perspective,
};
