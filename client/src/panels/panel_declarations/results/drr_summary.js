import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import { create_text_maker_component } from "src/components/index";

import * as Results from "src/models/results";

import { get_source_links } from "src/metadata/data_sources";

import { CommonDrrSummary } from "./CommonDrrSummary";

import {
  row_to_drr_status_counts,
  ResultCounts,
  GranularResultCounts,
} from "./results_common";

import text from "./drr_summary.yaml";

const { text_maker } = create_text_maker_component(text);

const { current_drr_key, result_docs } = Results;

const current_drr_year = result_docs[current_drr_key].year;

export const declare_drr_summary_panel = () =>
  declare_panel({
    panel_key: "drr_summary",
    subject_types: ["dept", "crso", "program"],
    panel_config_func: (subject_type) => ({
      requires_result_counts: subject_type === "dept",
      requires_granular_result_counts: subject_type !== "dept",
      footnotes: ["RESULTS", "DRR"],
      source: () => get_source_links(["DRR"]),
      title: text_maker("drr_summary_title", { year: current_drr_year }),
      calculate(subject) {
        const verbose_counts = (() => {
          switch (subject_type) {
            case "dept":
              return ResultCounts.get_dept_counts(subject.id);
            case "crso":
              return _.chain([subject.id, ..._.map(subject.programs, "id")])
                .map((id) => GranularResultCounts.get_subject_counts(id))
                .reduce(
                  (accumulator, counts) =>
                    _.mergeWith(accumulator, counts, _.add),
                  {}
                )
                .value();
            case "program":
              return GranularResultCounts.get_subject_counts(subject.id);
          }
        })();

        const counts = row_to_drr_status_counts(
          verbose_counts,
          current_drr_key
        );

        if (verbose_counts[`${current_drr_key}_total`] < 1) {
          return false;
        }

        return {
          verbose_counts,
          counts,
        };
      },
      render: ({ title, calculations, footnotes, sources }) => {
        const { panel_args, subject } = calculations;

        return (
          <InfographicPanel {...{ title, footnotes, sources }}>
            <CommonDrrSummary subject={subject} {...panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
