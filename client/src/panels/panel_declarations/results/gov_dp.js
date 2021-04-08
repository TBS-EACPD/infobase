import _ from "lodash";
import React, { Fragment } from "react";

import { HeightClippedGraph } from "src/panels/panel_declarations/common_panel_components.js";
import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  create_text_maker_component,
  default_dept_name_sort_func,
  SmartDisplayTable,
} from "src/components/index.js";

import { Subject } from "src/models/subject.js";

import { get_source_links } from "src/metadata/data_sources.js";

import { LateDepartmentsBanner } from "./result_components.js";
import {
  ResultCounts,
  filter_and_genericize_doc_counts,
  current_dp_key,
  result_docs,
  link_to_results_infograph,
} from "./results_common.js";

import text from "./gov_dp.yaml";

const { Dept } = Subject;
const { text_maker, TM } = create_text_maker_component(text);

const current_dp_year = result_docs[current_dp_key].year;
const current_dp_corresponding_drr_year =
  _.toNumber(result_docs[current_dp_key].year_short) + 1;

const DpSummary = ({
  counts,
  rows_of_counts_by_dept,
  column_configs,
  late_dept_count,
}) => {
  const current_dp_counts_with_generic_keys = filter_and_genericize_doc_counts(
    counts,
    current_dp_key
  );
  return (
    <Fragment>
      <div className="fcol-md-12 medium-panel-text">
        {late_dept_count > 0 && (
          <LateDepartmentsBanner late_dept_count={late_dept_count} />
        )}
        <TM
          k="gov_dp_text"
          args={{
            ...current_dp_counts_with_generic_keys,
            depts_with_dps: rows_of_counts_by_dept.length,
            year: current_dp_year,
            drr_tabling_year: current_dp_corresponding_drr_year,
          }}
        />
      </div>
      <HeightClippedGraph clipHeight={330}>
        <SmartDisplayTable
          table_name={"Government DP"}
          data={rows_of_counts_by_dept}
          column_configs={column_configs}
        />
      </HeightClippedGraph>
    </Fragment>
  );
};

export const declare_gov_dp_panel = () =>
  declare_panel({
    panel_key: "gov_dp",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      requires_result_counts: true,
      title: text_maker("gov_dp_summary_title", {
        year: current_dp_year,
      }),
      calculate: () => {
        const dept_counts = _.filter(
          ResultCounts.get_all_dept_counts(),
          (row) => row[`${current_dp_key}_results`] > 0
        );

        const subj_map = _.chain(dept_counts)
          .map((row) => [
            row.id,
            link_to_results_infograph(Dept.lookup(row.id)),
          ])
          .fromPairs()
          .value();

        const rows_of_counts_by_dept = _.map(dept_counts, (row) => ({
          subject_name: row.id,
          [`${current_dp_key}_results`]: row[`${current_dp_key}_results`],
          [`${current_dp_key}_indicators`]: row[`${current_dp_key}_indicators`],
        }));
        const column_configs = {
          subject_name: {
            index: 0,
            header: text_maker("org"),
            is_searchable: true,
            formatter: (value) =>
              subj_map[value] ? (
                <a href={subj_map[value]}> {Dept.lookup(value).name} </a>
              ) : (
                value
              ),
            sort_func: (a, b) => default_dept_name_sort_func(a, b),
            raw_formatter: (value) => (value ? Dept.lookup(value).name : value),
          },
          [`${current_dp_key}_results`]: {
            index: 1,
            header: text_maker("results"),
            is_summable: true,
            formatter: "big_int",
          },
          [`${current_dp_key}_indicators`]: {
            index: 2,
            header: text_maker("indicators"),
            is_summable: true,
            formatter: "big_int",
          },
        };
        const late_dept_count =
          result_docs[current_dp_key].late_results_orgs.length;

        return {
          column_configs,
          rows_of_counts_by_dept,
          late_dept_count,
        };
      },
      footnotes: ["DP"],
      source: (subject) => get_source_links(["DP"]),
      render({ title, calculations, sources, footnotes }) {
        const {
          panel_args: {
            rows_of_counts_by_dept,
            late_dept_count,
            column_configs,
          },
        } = calculations;
        const counts = ResultCounts.get_gov_counts();

        return (
          <InfographicPanel {...{ title, sources, footnotes }} allowOverflow>
            <DpSummary
              counts={counts}
              rows_of_counts_by_dept={rows_of_counts_by_dept}
              late_dept_count={late_dept_count}
              column_configs={column_configs}
            />
          </InfographicPanel>
        );
      },
    }),
  });
