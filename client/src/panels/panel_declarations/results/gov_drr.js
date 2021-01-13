import React from "react";

import _ from "lodash";

import {
  SmartDisplayTable,
  default_dept_name_sort_func,
} from "../../../components/index.js";
import {
  Subject,
  InfographicPanel,
  get_source_links,
  declare_panel,
  HeightClippedGraph,
} from "../shared.js";

import { DrrSummary } from "./drr_summary.js";
import { TM, text_maker } from "./drr_summary_text.js";
import { LateDepartmentsBanner } from "./result_components.js";
import {
  row_to_drr_status_counts,
  ResultCounts,
  result_statuses,
  result_docs,
  current_drr_key,
  link_to_results_infograph,
} from "./results_common.js";

const { Gov, Dept } = Subject;

class GovDRR extends React.Component {
  render() {
    const {
      rows_of_counts_by_dept,
      gov_counts,
      num_depts,
      verbose_gov_counts,
      late_dept_count,
      column_configs,
    } = this.props;

    return (
      <div>
        {late_dept_count > 0 && (
          <div className="medium-panel-text">
            <LateDepartmentsBanner late_dept_count={late_dept_count} />
          </div>
        )}
        <DrrSummary
          subject={Gov}
          verbose_counts={verbose_gov_counts}
          counts={gov_counts}
          is_gov={true}
          num_depts={num_depts}
        />
        <div className="panel-separator" style={{ marginTop: "0px" }} />
        <div>
          <div className="medium-panel-text">
            <TM k="gov_drr_summary_org_table_text" />
          </div>
          <HeightClippedGraph clipHeight={330}>
            <SmartDisplayTable
              table_name={"Government DRR"}
              data={rows_of_counts_by_dept}
              column_configs={column_configs}
            />
          </HeightClippedGraph>
        </div>
      </div>
    );
  }
}

export const declare_gov_drr_panel = () =>
  declare_panel({
    panel_key: "gov_drr",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      requires_result_counts: true,
      footnotes: ["RESULTS_COUNTS", "DRR"],
      source: (subject) => get_source_links(["DRR"]),

      calculate() {
        const verbose_gov_counts = ResultCounts.get_gov_counts();
        const gov_counts = row_to_drr_status_counts(
          verbose_gov_counts,
          current_drr_key
        );

        const dept_counts = _.filter(
          ResultCounts.get_all_dept_counts(),
          (row) => row[`${current_drr_key}_total`] > 0
        );
        const num_depts = dept_counts.length;

        const column_keys = _.chain(result_statuses)
          .map((row, key) => [`${current_drr_key}_indicators_${key}`, row.text])
          .fromPairs()
          .value();

        const subj_map = _.chain(dept_counts)
          .map((row) => [
            row.id,
            link_to_results_infograph(Dept.lookup(row.id)),
          ])
          .fromPairs()
          .value();

        const rows_of_counts_by_dept = _.map(dept_counts, (row) => ({
          subject_name: row.id,
          ..._.chain(column_keys)
            .keys()
            .map((column_key) => [column_key, row[column_key]])
            .fromPairs()
            .value(),
        }));
        const column_configs = {
          subject_name: {
            index: 0,
            header: text_maker("org"),
            is_searchable: true,
            formatter: (value) =>
              value ? (
                <a href={subj_map[value]}> {Dept.lookup(value).name} </a>
              ) : (
                value
              ),
            sort_func: (a, b) => default_dept_name_sort_func(a, b),
            raw_formatter: (value) => (value ? Dept.lookup(value).name : value),
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
          result_docs[current_drr_key].late_results_orgs.length;

        return {
          gov_counts,
          rows_of_counts_by_dept,
          verbose_gov_counts,
          num_depts,
          column_configs,
          late_dept_count,
        };
      },

      render({ calculations, footnotes, sources }) {
        const { panel_args } = calculations;

        return (
          <InfographicPanel
            title={text_maker("gov_drr_summary_title", {
              year: result_docs[current_drr_key].year,
            })}
            {...{ footnotes, sources }}
          >
            <GovDRR {...panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
