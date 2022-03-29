import _ from "lodash";
import React, { Fragment, useState } from "react";

import { HeightClippedGraph } from "src/panels/panel_declarations/common_panel_components";
import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  create_text_maker_component,
  DisplayTable,
  Tabs,
} from "src/components/index";

import { Dept } from "src/models/subjects";

import { get_source_links } from "src/DatasetsRoute/utils";

import { LateDepartmentsBanner } from "./result_components";
import {
  ResultCounts,
  filter_and_genericize_doc_counts,
  get_result_doc_keys,
  result_docs,
  link_to_results_infograph,
  get_year_for_doc_key,
} from "./results_common";

import text from "./gov_dp.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const dp_keys = get_result_doc_keys("dp");

const get_dp_corresponding_drr_year = (dp_key) =>
  _.toNumber(result_docs[dp_key].year_short) + 1;

const get_dp_data = (dp_key) => {
  const dept_counts = _.filter(
    ResultCounts.get_all_dept_counts(),
    (row) => row[`${dp_key}_results`] > 0
  );

  const subj_map = _.chain(dept_counts)
    .map((row) => [
      row.id,
      link_to_results_infograph(Dept.store.lookup(row.id)),
    ])
    .fromPairs()
    .value();

  const rows_of_counts_by_dept = _.map(dept_counts, (row) => ({
    subject_name: row.id,
    [`${dp_key}_results`]: row[`${dp_key}_results`],
    [`${dp_key}_indicators`]: row[`${dp_key}_indicators`],
  }));
  const column_configs = {
    subject_name: {
      index: 0,
      header: text_maker("org"),
      is_searchable: true,
      formatter: (value) =>
        subj_map[value] ? (
          <a href={subj_map[value]}> {Dept.store.lookup(value).name} </a>
        ) : (
          value
        ),
      plain_formatter: (value) =>
        value ? Dept.store.lookup(value).name : value,
    },
    [`${dp_key}_results`]: {
      index: 1,
      header: text_maker("results"),
      is_summable: true,
      formatter: "big_int",
    },
    [`${dp_key}_indicators`]: {
      index: 2,
      header: text_maker("indicators"),
      is_summable: true,
      formatter: "big_int",
    },
  };
  const late_dept_count = result_docs[dp_key].late_results_orgs.length;

  return {
    column_configs,
    rows_of_counts_by_dept,
    late_dept_count,
    counts_with_generic_keys: filter_and_genericize_doc_counts(
      ResultCounts.get_gov_counts(),
      dp_key
    ),
  };
};

const DpSummary = () => {
  const [dp_key, set_dp_key] = useState(_.last(dp_keys));

  const {
    rows_of_counts_by_dept,
    column_configs,
    late_dept_count,
    counts_with_generic_keys,
  } = get_dp_data(dp_key);

  const panel_content = (
    <Fragment>
      <div className="col-12 col-lg-12 medium-panel-text">
        {late_dept_count > 0 && (
          <LateDepartmentsBanner late_dept_count={late_dept_count} />
        )}
        <TM
          k="gov_dp_text"
          args={{
            ...counts_with_generic_keys,
            depts_with_dps: rows_of_counts_by_dept.length,
            year: get_year_for_doc_key(dp_key),
            drr_tabling_year: get_dp_corresponding_drr_year(dp_key),
          }}
        />
      </div>
      <HeightClippedGraph clipHeight={330}>
        <DisplayTable
          table_name={"Government DP"}
          data={rows_of_counts_by_dept}
          column_configs={column_configs}
        />
      </HeightClippedGraph>
    </Fragment>
  );

  if (dp_keys.length > 1) {
    return (
      <Tabs
        tabs={_.chain(dp_keys)
          .map((dp_key) => [dp_key, get_year_for_doc_key(dp_key)])
          .fromPairs()
          .value()}
        open_tab_key={dp_key}
        tab_open_callback={set_dp_key}
      >
        {panel_content}
      </Tabs>
    );
  } else {
    return panel_content;
  }
};

export const declare_gov_dp_panel = () =>
  declare_panel({
    panel_key: "gov_dp",
    subject_types: ["gov"],
    panel_config_func: () => ({
      requires_result_counts: true,
      title: text_maker("gov_dp_summary_title", {
        first_year: get_year_for_doc_key(_.first(dp_keys)),
        last_year: dp_keys.length > 1 && get_year_for_doc_key(_.last(dp_keys)),
      }),
      calculate: () => !_.isEmpty(dp_keys),
      footnotes: ["RESULTS", "DP"],
      source: () => get_source_links(["DP"]),
      render({ title, sources, footnotes }) {
        return (
          <InfographicPanel {...{ title, sources, footnotes }} allowOverflow>
            <DpSummary />
          </InfographicPanel>
        );
      },
    }),
  });
