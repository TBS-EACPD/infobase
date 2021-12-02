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
      this.props.default_doc
    );

    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    const { subject, default_doc } = this.props;

    ensure_loaded({
      subject,
      results: true,
      result_docs: [default_doc],
    }).then(() => this.setState({ loading: false }));
  }
  render() {
    const { subject, docs_with_data } = this.props;
    const { loading } = this.state;

    if (loading) {
      return <LeafSpinner config_name={"subroute"} />;
    } else {
      return this.explorer_instance.to_react_element({
        subject,
        docs_with_data,
      });
    }
  }
}

const get_docs_with_data = (subject, subject_type) => {
  const subject_result_counts =
    subject_type === "dept"
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

  const docs_with_data_in_tabling_order = _.chain(result_docs_in_tabling_order)
    .map("doc_key")
    .intersection(docs_with_data)
    .value();

  // DRR_TODO temporary special case (although should be future proof) to set drr19 as the default tab,
  // done so that the (temporarily) only year with GBA Plus day is the default
  // Can drop and return to just most-recent by tabling date with DRR 2020-21
  const default_doc = (() => {
    const drr19 = "drr19";

    const has_drr19_data = _.includes(docs_with_data, drr19);

    const is_pre_drr20 = !_.chain(result_docs).keys().includes("drr20").value();

    if (has_drr19_data && is_pre_drr20) {
      return drr19;
    } else {
      return _.last(docs_with_data_in_tabling_order);
    }
  })();

  return {
    docs_with_data,
    default_doc: default_doc,
  };
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
    subject_types: ["dept", "crso", "program"],
    panel_config_func: (subject_type, panel_key) => ({
      footnotes: ["RESULTS", "DRR", "DP"],
      depends_on: ["programSpending", "programFtes"],
      source: (subject) => get_source_links(["DP", "DRR"]),
      requires_result_counts: subject_type === "dept",
      requires_granular_result_counts: subject_type !== "dept",
      calculate(subject) {
        return get_docs_with_data(subject, subject_type);
      },
      title: (subject) => {
        const year_range_with_data = get_year_range_with_data(
          get_docs_with_data(subject, subject_type).docs_with_data
        );
        return text_maker("result_drilldown_title", {
          ...year_range_with_data,
        });
      },
      render({ title, calculations, sources, footnotes }) {
        const {
          subject,
          panel_args: { docs_with_data, default_doc },
        } = calculations;

        return (
          <InfographicPanel {...{ title, sources, footnotes }}>
            <SingleSubjResultsContainer
              {...{
                subject,
                docs_with_data,
                default_doc,
              }}
            />
          </InfographicPanel>
        );
      },
    }),
  });
