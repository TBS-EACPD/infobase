import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { text_maker } from "src/panels/panel_declarations/results/result_text_provider";
import {
  ResultCounts,
  GranularResultCounts,
  result_docs,
  result_docs_in_tabling_order,
} from "src/panels/panel_declarations/results/results_common";

import { LeafSpinner } from "src/components/index";

import { ensure_loaded } from "src/core/ensure_loaded";

import { get_source_links } from "src/metadata/data_sources";

import ResultsExplorer from "./results_scheme";

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
          <LeafSpinner config_name={"tabbed_content"} />
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

const get_docs_with_data = (subject, level) => {
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
};

const get_year_range_with_data = (docs_with_data) =>
  _.chain(docs_with_data)
    .map((doc) => result_docs[doc].year)
    .thru((years_with_data) => ({
      first_year: years_with_data[0],
      last_year: years_with_data.length > 1 && _.last(years_with_data),
    }))
    .value();

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
        return get_docs_with_data(subject, level);
      },
      title: (subject) => {
        const year_range_with_data = get_year_range_with_data(
          get_docs_with_data(subject, level).docs_with_data
        );
        return text_maker("result_drilldown_title", {
          ...year_range_with_data,
        });
      },
      render({ title, calculations, sources, footnotes }) {
        const {
          subject,
          panel_args: { docs_with_data, latest_doc_with_data },
        } = calculations;

        return (
          <InfographicPanel {...{ title, sources, footnotes }}>
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
