import _ from "lodash";
import React from "react";

import { TabLoadingWrapper } from "src/components/index.js";

import { businessConstants } from "src/models/businessConstants.js";

import { lang } from "src/core/injected_build_constants.js";

import { ToggleVoteStatProvider } from "./covid_common_components.js";

const { estimates_docs } = businessConstants;

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

const summable_data_keys = ["stat", "vote"];
const row_group_reducer = (group) => {
  const keys_to_sum_over = _.chain(group)
    .first()
    .keys()
    .intersection(summable_data_keys)
    .value();

  return _.reduce(group, (memo, row) =>
    _.chain(keys_to_sum_over)
      .map((key) => [key, _.get(memo, key, 0) + _.get(row, key, 0)])
      .fromPairs()
      .value()
  );
};
const roll_up_flat_measure_data_by_property = (
  flat_measure_data,
  roll_up_property,
  sub_group_property = null
) =>
  _.chain(flat_measure_data)
    .groupBy(roll_up_property)
    .flatMap((roll_up_group, roll_up_value) =>
      _.chain(roll_up_group)
        .groupBy("fiscal_year")
        .flatMap((year_group, fiscal_year) => {
          if (sub_group_property) {
            return _.chain(year_group)
              .groupBy(sub_group_property)
              .flatMap((sub_group, sub_group_value) => ({
                [roll_up_property]: roll_up_value,
                [sub_group_property]: sub_group_value,
                fiscal_year,
                ...row_group_reducer(sub_group),
              }))
              .value();
          } else {
            return {
              [roll_up_property]: roll_up_value,
              fiscal_year,
              ...row_group_reducer(year_group),
            };
          }
        })
        .value()
    )
    .value();

export {
  get_tabbed_content_props,
  wrap_with_vote_stat_controls,
  get_est_doc_name,
  get_est_doc_order,
  est_doc_sort_func,
  get_est_doc_glossary_key,
  string_sort_func,
  roll_up_flat_measure_data_by_property,
};
