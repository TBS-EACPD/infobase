import _ from "lodash";
import React from "react";

import { lang } from "src/core/injected_build_constants.js";

import { util_components, businessConstants } from "../shared.js";

import { ToggleVoteStatProvider } from "./covid_common_components.js";

const { estimates_docs } = businessConstants;
const { TabLoadingWrapper } = util_components;

const get_tabbed_content_props = (tab_content_configs, panel_args) => {
  const configs_for_level = _.filter(tab_content_configs, ({ levels }) =>
    _.includes(levels, panel_args.subject.level)
  );

  return {
    tab_keys: _.map(configs_for_level, "key"),
    tab_labels: _.chain(configs_for_level)
      .map(({ key, label }) => [key, label])
      .fromPairs()
      .value(),
    tab_pane_contents: _.chain(configs_for_level)
      .map(({ key, load_data, TabContent }) => [
        key,
        <TabLoadingWrapper
          args={panel_args}
          load_data={load_data}
          TabContent={TabContent}
          key={key}
        />,
      ])
      .fromPairs()
      .value(),
  };
};

const wrap_with_vote_stat_controls = (Component) => (props) => (
  <ToggleVoteStatProvider Inner={Component} inner_props={props} />
);

// TODO these est doc utils should move to somewhere central, maybe in models
const get_est_doc_name = (est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc][lang] : "";
const get_est_doc_order = (est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc].order : 9999;
const est_doc_sort_func = (est_doc_a, est_doc_b) => {
  const order_a = get_est_doc_order(est_doc_a);
  const order_b = get_est_doc_order(est_doc_b);

  if (order_a < order_b) {
    return -1;
  } else if (order_a > order_b) {
    return 1;
  }
  return 0;
};
const get_est_doc_glossary_key = (est_doc) =>
  ({
    MAINS: "MAINS",
    MYA: "MYA",
    VA: "VOTED",
    SA: "ADJUS",
    SEA: "SUPPSA",
    SEB: "SUPPSB",
    SEC: "SUPPSC",
    IE: "INTER_EST",
  }[est_doc]);

const get_plain_string = (string) =>
  _.chain(string).deburr().lowerCase().value();
const string_sort_func = (a, b) => {
  const plain_a = get_plain_string(a);
  const plain_b = get_plain_string(b);

  if (plain_a < plain_b) {
    return -1;
  } else if (plain_a > plain_b) {
    return 1;
  }
  return 0;
};

export {
  get_tabbed_content_props,
  wrap_with_vote_stat_controls,
  get_est_doc_name,
  get_est_doc_order,
  est_doc_sort_func,
  get_est_doc_glossary_key,
  string_sort_func,
};
