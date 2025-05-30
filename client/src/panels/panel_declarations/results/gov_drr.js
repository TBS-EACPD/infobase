import _ from "lodash";
import React, { useState } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, Tabs } from "src/components/index";

import { Gov, Dept } from "src/models/subjects";

import { CommonDrrSummary } from "./CommonDrrSummary";
import { LateDepartmentsBanner } from "./result_components";
import {
  row_to_drr_status_counts,
  ResultCounts,
  ResultDrCounts,
  ResultPrCounts,
  result_statuses,
  result_docs,
  link_to_results_infograph,
  get_result_doc_keys,
  get_year_for_doc_key,
} from "./results_common";

import text from "./gov_drr.yaml";

const { text_maker } = create_text_maker_component(text);

const drr_keys = get_result_doc_keys("drr");

const get_rows_of_counts_by_dept = (dept_counts, column_keys) => {
  return _.map(dept_counts, (row) => ({
    subject_name: row.id,
    ..._.chain(column_keys)
      .keys()
      .map((column_key) => [column_key, row[column_key]])
      .fromPairs()
      .value(),
  }));
};

const get_drr_data = (drr_key) => {
  const verbose_counts = {
    total: ResultCounts.get_gov_counts(),
    dr: ResultDrCounts.get_gov_counts(),
    pr: ResultPrCounts.get_gov_counts(),
  };

  const gov_counts = {
    total_indicator_status: row_to_drr_status_counts(
      verbose_counts.total,
      drr_key
    ),
    dept_indicator_status: row_to_drr_status_counts(verbose_counts.dr, drr_key),
    program_indicator_status: row_to_drr_status_counts(
      verbose_counts.pr,
      drr_key
    ),
  };

  const dept_counts = _.filter(
    ResultCounts.get_all_dept_counts(),
    (row) => row[`${drr_key}_total`] > 0
  );

  const dr_dept_counts = _.filter(
    ResultDrCounts.get_all_dept_counts(),
    (row) => row[`${drr_key}_total`] > 0
  );

  const pr_dept_counts = _.filter(
    ResultPrCounts.get_all_dept_counts(),
    (row) => row[`${drr_key}_total`] > 0
  );

  const results_dept_count = dept_counts.length;

  const column_keys = _.chain(result_statuses)
    .map((row, key) => [`${drr_key}_indicators_${key}`, row.text])
    .fromPairs()
    .value();

  const rows_of_counts_by_dept = {
    total: get_rows_of_counts_by_dept(dept_counts, column_keys),
    dr: get_rows_of_counts_by_dept(dr_dept_counts, column_keys),
    pr: get_rows_of_counts_by_dept(pr_dept_counts, column_keys),
  };

  const subj_map = _.chain(dept_counts)
    .map((row) => [
      row.id,
      link_to_results_infograph(Dept.store.lookup(row.id)),
    ])
    .fromPairs()
    .value();

  const column_configs = {
    subject_name: {
      index: 0,
      header: text_maker("org"),
      is_searchable: true,
      formatter: (value) =>
        value ? (
          <a href={subj_map[value]}> {Dept.store.lookup(value).name} </a>
        ) : (
          value
        ),
      plain_formatter: (value) =>
        value ? Dept.store.lookup(value).name : value,
    },
    ..._.chain(column_keys)
      .keys()
      .map((column_key, index) => [
        column_key,
        {
          index: index + 1,
          header: column_keys[column_key],
          is_summable: true,
          formatter: "big_int",
        },
      ])
      .fromPairs()
      .value(),
  };
  const late_dept_count =
    result_docs[drr_key].late_results_orgs.length +
    result_docs[drr_key].temp_untabled_orgs.length;

  return {
    gov_counts,
    rows_of_counts_by_dept,
    verbose_counts,
    results_dept_count,
    column_configs,
    late_dept_count,
  };
};

const DrrSummary = () => {
  const [drr_key, set_drr_key] = useState(_.last(drr_keys));

  const {
    rows_of_counts_by_dept,
    gov_counts,
    results_dept_count,
    verbose_counts,
    late_dept_count,
    column_configs,
  } = get_drr_data(drr_key);

  const panel_content = (
    <div>
      {late_dept_count > 0 && (
        <div className="medium-panel-text">
          <LateDepartmentsBanner late_dept_count={late_dept_count} />
        </div>
      )}
      <CommonDrrSummary
        subject={Gov.instance}
        drr_key={drr_key}
        verbose_counts={verbose_counts}
        counts={gov_counts}
        results_dept_count={results_dept_count}
        rows_of_counts_by_dept={rows_of_counts_by_dept}
        column_configs={column_configs}
      />
    </div>
  );

  if (drr_keys.length > 1) {
    return (
      <Tabs
        tabs={_.chain(drr_keys)
          .map((drr_key) => [drr_key, get_year_for_doc_key(drr_key)])
          .fromPairs()
          .value()}
        open_tab_key={drr_key}
        tab_open_callback={set_drr_key}
      >
        {panel_content}
      </Tabs>
    );
  } else {
    return panel_content;
  }
};

export const declare_gov_drr_panel = () =>
  declare_panel({
    panel_key: "gov_drr",
    subject_types: ["gov"],
    panel_config_func: () => ({
      legacy_non_table_dependencies: ["requires_result_counts"],
      get_title: () =>
        text_maker("gov_drr_summary_title", {
          first_year: get_year_for_doc_key(_.first(drr_keys)),
          last_year:
            drr_keys.length > 1 && get_year_for_doc_key(_.last(drr_keys)),
        }),
      get_dataset_keys: () => ["actual_results"],
      calculate: () => !_.isEmpty(drr_keys),
      render({ title, calculations, footnotes, sources, datasets }) {
        return (
          <InfographicPanel {...{ title, footnotes, sources, datasets }}>
            <DrrSummary {...calculations} />
          </InfographicPanel>
        );
      },
    }),
  });
