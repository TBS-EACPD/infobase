import _ from "lodash";
import React, { useState, useEffect } from "react";

import { LeafSpinner } from "src/components/LeafSpinner/LeafSpinner";

import { businessConstants } from "src/models/businessConstants";

import { array_to_grammatical_list } from "src/core/format";
import { lang } from "src/core/injected_build_constants";

import { smart_sort_func } from "src/sort_utils";

import { ToggleVoteStatProvider } from "./covid_common_components";

import { covid_create_text_maker_component } from "./covid_text_provider";

const { text_maker } = covid_create_text_maker_component();

const { estimates_docs } = businessConstants;

const TabLoadingWrapper = ({ panel_args, load_data, TabContent }) => {
  const [loading, set_loading] = useState(true);
  const [data, set_data] = useState([]);

  useEffect(() => {
    loading &&
      load_data(panel_args).then((data) => {
        set_data(data);
        set_loading(false);
      });
  });

  if (loading) {
    return <LeafSpinner config_name={"subroute"} />;
  } else {
    return <TabContent args={panel_args} data={data} />;
  }
};
const get_tabbed_content_props = (tab_content_configs, panel_args) => {
  const configs_for_subject_type = _.filter(
    tab_content_configs,
    ({ subject_types }) =>
      _.includes(subject_types, panel_args.subject.subject_type)
  );

  return _.map(
    configs_for_subject_type,
    ({ key, label, load_data, TabContent }) => ({
      key,
      label,
      content: (
        <TabLoadingWrapper
          panel_args={panel_args}
          load_data={load_data}
          TabContent={TabContent}
        />
      ),
    })
  );
};

const wrap_with_vote_stat_controls = (Component) => (props) =>
  <ToggleVoteStatProvider Inner={Component} inner_props={props} />;

// TODO these est doc utils should move to somewhere central, maybe in models
const get_est_doc_name = (est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc][lang] : "";
const get_est_doc_order = (est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc].order : 9999;
const est_doc_sort_func = (est_doc_a, est_doc_b, descending) => {
  const order_a = get_est_doc_order(est_doc_a);
  const order_b = get_est_doc_order(est_doc_b);

  return smart_sort_func(order_a, order_b, descending);
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
const get_est_doc_list_plain_text = (est_docs) =>
  _.chain(est_docs)
    .sortBy(get_est_doc_order)
    .groupBy((est_doc) => /^SE[A-Z]$/.test(est_doc))
    .flatMap((est_docs, is_supps_group) => {
      if (is_supps_group === "false") {
        return _.map(est_docs, get_est_doc_name);
      } else {
        return text_maker("supps_list", {
          supps_letters: _.map(est_docs, _.last),
        });
      }
    })
    .thru(array_to_grammatical_list)
    .value();

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
    .flatMap((roll_up_group) => {
      // could get this from the key arg to the predicate, but may lose the original type in the process
      // since the key value will have been converted to a string (happens with fiscal_year below, but we
      // know that should be an int so can just covert back ourselves)
      const roll_up_value = _.chain(roll_up_group)
        .first()
        .get(roll_up_property)
        .value();

      return _.chain(roll_up_group)
        .groupBy("fiscal_year")
        .flatMap((year_group, fiscal_year) => {
          if (sub_group_property) {
            return _.chain(year_group)
              .groupBy(sub_group_property)
              .flatMap((sub_group, sub_group_value) => ({
                [roll_up_property]: roll_up_value,
                [sub_group_property]: sub_group_value,
                fiscal_year: +fiscal_year,
                ...row_group_reducer(sub_group),
              }))
              .value();
          } else {
            return {
              [roll_up_property]: roll_up_value,
              fiscal_year: +fiscal_year,
              ...row_group_reducer(year_group),
            };
          }
        })
        .value();
    })
    .value();

const get_date_last_updated_text = (fiscal_year, month_last_updated) => {
  const calendar_year = (() => {
    if (month_last_updated > 3) {
      return fiscal_year;
    } else {
      return fiscal_year + 1;
    }
  })();

  // two quirks of Date...
  //  1) month is 0 indexed, even though year and day aren't
  //  2) day zero of a given month returns the last day of the prior month
  // ... so even though our month_last_updated is NOT zero indexed, "day zero" of month_last_updated gives what we want
  const end_of_month_date = new Date(calendar_year, month_last_updated, 0);

  return new Intl.DateTimeFormat(`${lang}-CA`, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(end_of_month_date);
};

export {
  get_tabbed_content_props,
  wrap_with_vote_stat_controls,
  get_est_doc_name,
  get_est_doc_order,
  est_doc_sort_func,
  get_est_doc_glossary_key,
  roll_up_flat_measure_data_by_property,
  get_date_last_updated_text,
  get_est_doc_list_plain_text,
};
