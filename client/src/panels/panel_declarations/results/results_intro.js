import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component } from "src/components/index";

import { Dept } from "src/models/subjects";

import { lang, is_a11y_mode } from "src/core/injected_build_constants";

import { get_static_url } from "src/request_utils";

import {
  ResultCounts,
  GranularResultCounts,
  result_docs,
  current_drr_key,
  current_dp_key,
} from "./results_common";

import text from "./results_intro_text.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const ResultsIntroPanel = ({
  subject,
  is_gov,
  summary_result_counts,
  doc_urls,
  has_current_dp,
  has_current_drr,
}) => {
  const summary_text_args = { subject, is_gov, ...summary_result_counts };

  return (
    <div className="row align-items-center">
      <div className="col-12 col-lg-7 medium-panel-text">
        <TM k="results_intro_text" />
        <TM k="gba_plus_intro_text" />
      </div>
      {!is_a11y_mode && (
        <div className="col-12 col-lg-5">
          <div
            style={{
              padding: "20px",
            }}
          >
            <img
              alt={text_maker("results_intro_img_text")}
              src={get_static_url(`png/result-taxonomy-${lang}.png`)}
              style={{
                width: "100%",
                maxHeight: "500px",
              }}
            />
          </div>
        </div>
      )}
      <div className="col-12 col-lg-12 medium-panel-text">
        {has_current_dp && (
          <TM
            k="dp_summary_text"
            args={{
              ...summary_text_args,
              year: result_docs[current_dp_key].year,
              tabling_year:
                _.toNumber(result_docs[current_dp_key].year_short) + 1,
            }}
          />
        )}
        {has_current_drr && (
          <TM
            k="drr_summary_text"
            args={{
              ...summary_text_args,
              year: result_docs[current_drr_key].year,
            }}
          />
        )}
        {_.some(doc_urls, (doc_url) => !_.isNull(doc_url)) && (
          <TM k="reports_links_text" args={doc_urls} />
        )}
      </div>
    </div>
  );
};

export const declare_results_intro_panel = () =>
  declare_panel({
    panel_key: "results_intro",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => ({
      requires_result_counts: subject_type === "gov",
      requires_granular_result_counts: subject_type !== "gov",
      footnotes: ["RESULTS", "DRR", "DP"],
      get_dataset_keys: () => ["actual_results", "planned_results"],
      get_title: () => text_maker("results_intro_title"),
      calculate: ({ subject }) => {
        const is_gov = subject.subject_type == "gov";

        const verbose_counts = (() => {
          if (is_gov) {
            const dept_counts = ResultCounts.get_all_dept_counts();
            const gov_counts = _.mergeWith({}, ...dept_counts, (val, src) =>
              _.isNumber(val) ? val + src : src
            );

            const counts_by_dept = _.chain(dept_counts)
              .map((row) => ({
                subject: Dept.store.lookup(row.id),
                counts: row,
              }))
              .map((obj) => ({ ...obj, total: sum(_.values(obj.counts)) }))
              .value();
            const depts_with_dps = _.sumBy(counts_by_dept, (dept) =>
              dept.counts[`${current_dp_key}_results`] > 0 ? 1 : 0
            );
            const depts_with_drrs = _.sumBy(counts_by_dept, (dept) =>
              dept.counts[`${current_drr_key}_results`] > 0 ? 1 : 0
            );

            return {
              depts_with_dps,
              depts_with_drrs,
              ..._.omit(gov_counts, ["id", "subject_type", "subject_id"]),
            };
          } else {
            return {
              num_crs: _.chain(subject.crsos)
                .map(({ id }) =>
                  _.get(
                    GranularResultCounts.get_subject_counts(id),
                    `${current_dp_key}_results`
                  )
                )
                .compact()
                .size()
                .value(),
              num_programs: _.chain(subject.programs)
                .map(({ id }) =>
                  _.get(
                    GranularResultCounts.get_subject_counts(id),
                    `${current_dp_key}_results`
                  )
                )
                .compact()
                .size()
                .value(),
              ...ResultCounts.get_dept_counts(subject.id),
            };
          }
        })();

        const has_current_dp = verbose_counts[`${current_dp_key}_results`] > 0;
        const has_current_drr =
          verbose_counts[`${current_drr_key}_results`] > 0;

        if (!has_current_dp && !has_current_drr) {
          return false;
        }

        const summary_result_counts = {
          dp_results: verbose_counts[`${current_dp_key}_results`],
          dp_indicators: verbose_counts[`${current_dp_key}_indicators`],
          drr_results: verbose_counts[`${current_drr_key}_results`],
          drr_indicators: verbose_counts[`${current_drr_key}_total`],
          num_crs: is_gov ? false : verbose_counts.num_crs,
          num_programs: is_gov ? false : verbose_counts.num_programs,
          depts_with_dps: is_gov ? verbose_counts.depts_with_dps : false,
          depts_with_drrs: is_gov ? verbose_counts.depts_with_drrs : false,
        };

        const doc_urls = {
          dp_url: result_docs[current_dp_key][`doc_url_${lang}`],
          drr_url: result_docs[current_drr_key][`doc_url_${lang}`],
        };

        return {
          subject,
          is_gov,
          summary_result_counts,
          doc_urls,
          has_current_dp,
          has_current_drr,
        };
      },
      render({ title, subject, calculations, sources, datasets, footnotes }) {
        return (
          <InfographicPanel {...{ title, sources, datasets, footnotes }}>
            <ResultsIntroPanel subject={subject} {...calculations} />
          </InfographicPanel>
        );
      },
    }),
  });
