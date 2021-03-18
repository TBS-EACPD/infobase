import _ from "lodash";
import React from "react";

import {InfographicPanel} from "src/panels/panel_declarations/InfographicPanel.js";
import { text_maker } from "src/panels/panel_declarations/results/result_text_provider.js";
import {
  ResultCounts,
  GranularResultCounts,
  result_docs,
  result_docs_in_tabling_order,
} from "src/panels/panel_declarations/results/results_common.js";
import {declare_panel} from "src/panels/panel_declarations/shared.js";

import * as util_components from "src/components/index.js";

import { ensure_loaded } from "src/core/ensure_loaded.js";

import { get_source_links } from "src/metadata/data_sources.js";


import ResultsExplorer from "./results_scheme.js";

const { SpinnerWrapper } = util_components;

class SingleSubjResultsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.explorer_instance = new ResultsExplorer(
      this.props.subject.guid,
      this.props.latest_doc_with_data
    );

    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    const { subject, latest_doc_with_data } = this.props;

    ensure_loaded({
      subject,
      results: true,
      result_docs: [latest_doc_with_data],
    }).then(() => this.setState({ loading: false }));
  }
  render() {
    const { subject, docs_with_data } = this.props;
    const { loading } = this.state;

    if (loading) {
      return (
        <div
          style={{
            position: "relative",
            height: "80px",
            marginBottom: "-10px",
          }}
        >
          <SpinnerWrapper config_name={"tabbed_content"} />
        </div>
      );
    } else {
      return this.explorer_instance.to_react_element({
        subject,
        docs_with_data,
      });
    }
  }
}

export const declare_explore_results_panel = () =>
  declare_panel({
    panel_key: "explore_results",
    levels: ["dept", "crso", "program"],
    panel_config_func: (level, panel_key) => ({
      footnotes: ["RESULTS", "DRR", "DP"],
      depends_on: ["programSpending", "programFtes"],
      source: (subject) => get_source_links(["DP", "DRR"]),
      requires_result_counts: level === "dept",
      requires_granular_result_counts: level !== "dept",
      calculate(subject) {
        const subject_result_counts =
          level === "dept"
            ? ResultCounts.get_dept_counts(subject.id)
            : GranularResultCounts.get_subject_counts(subject.id);

        const had_doc_data = (doc_key) => {
          const count_key = /drr/.test(doc_key)
            ? `${doc_key}_total`
            : `${doc_key}_indicators`;
          return (
            !_.isUndefined(subject_result_counts) &&
            !_.isNull(subject_result_counts[count_key]) &&
            subject_result_counts[count_key] > 0
          );
        };

        const docs_with_data = _.chain(result_docs)
          .keys()
          .filter(had_doc_data)
          .value();

        if (_.isEmpty(docs_with_data)) {
          return false;
        }

        const latest_doc_with_data = _.chain(result_docs_in_tabling_order)
          .map("doc_key")
          .intersection(docs_with_data)
          .last()
          .value();

        return { docs_with_data, latest_doc_with_data };
      },

      render({ calculations, sources, footnotes }) {
        const {
          subject,
          panel_args: { docs_with_data, latest_doc_with_data },
        } = calculations;

        const year_range_with_data = _.chain(docs_with_data)
          .map((doc) => result_docs[doc].year)
          .thru((years_with_data) => ({
            first_year: years_with_data[0],
            last_year: years_with_data.length > 1 && _.last(years_with_data),
          }))
          .value();

        return (
          <InfographicPanel
            title={text_maker("result_drilldown_title", {
              ...year_range_with_data,
            })}
            sources={sources}
            footnotes={footnotes}
          >
            <SingleSubjResultsContainer
              {...{
                subject,
                docs_with_data,
                latest_doc_with_data,
              }}
            />
          </InfographicPanel>
        );
      },
    }),
  });
