import _ from "lodash";
import React, { useState } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  Tabs,
  LeafSpinner,
} from "src/components/index";

import { CommonDrrSummary } from "./CommonDrrSummary";

import {
  ResultCounts,
  GranularResultCounts,
  get_year_for_doc_key,
  load_results_api,
  hierarchy_to_counts,
} from "./results_common";

import text from "./drr_summary.yaml";

const { text_maker } = create_text_maker_component(text);

const get_verbose_counts = (subject) => {
  switch (subject.subject_type) {
    case "dept":
      return ResultCounts.get_dept_counts(subject.id);
    case "crso":
      return _.chain([subject.id, ..._.map(subject.programs, "id")])
        .map((id) => GranularResultCounts.get_subject_counts(id))
        .reduce(
          (accumulator, counts) => _.mergeWith(accumulator, counts, _.add),
          {}
        )
        .value();
    case "program":
      return GranularResultCounts.get_subject_counts(subject.id);
  }
};
const get_drr_keys_with_data = (subject) =>
  _.chain(get_verbose_counts(subject))
    .pickBy(
      (count_value, count_key) =>
        /^drr[0-9]*_total$/.test(count_key) && count_value !== 0
    )
    .keys()
    .map((count_key) => _.split(count_key, "_")[0])
    .value();

const DrrSummary = ({ subject, drr_keys, verbose_counts }) => {
  const [drr_key, set_drr_key] = useState(_.last(drr_keys));

  const { loading, data } = load_results_api(subject);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const counts = hierarchy_to_counts(data, drr_key);

  const summary = (
    <CommonDrrSummary
      subject={subject}
      drr_key={drr_key}
      verbose_counts={verbose_counts}
      counts={counts}
    />
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
        {summary}
      </Tabs>
    );
  } else {
    return summary;
  }
};

export const declare_drr_summary_panel = () =>
  declare_panel({
    panel_key: "drr_summary",
    subject_types: ["dept", "crso", "program"],
    panel_config_func: (subject_type) => ({
      legacy_non_table_dependencies:
        subject_type === "dept"
          ? ["requires_result_counts"]
          : ["requires_granular_result_counts"],
      get_title: ({ subject }) => {
        const drr_keys = get_drr_keys_with_data(subject);

        return (
          !_.isEmpty(drr_keys) &&
          text_maker("drr_summary_title", {
            first_year: get_year_for_doc_key(_.first(drr_keys)),
            last_year:
              drr_keys.length > 1 && get_year_for_doc_key(_.last(drr_keys)),
          })
        );
      },
      get_dataset_keys: () => ["actual_results"],
      calculate: ({ subject }) => {
        const drr_keys = get_drr_keys_with_data(subject);

        if (_.isEmpty(drr_keys)) {
          return false;
        }

        return {
          drr_keys,
          verbose_counts: get_verbose_counts(subject),
        };
      },
      render: ({
        title,
        subject,
        calculations,
        footnotes,
        sources,
        datasets,
      }) => {
        const { verbose_counts, drr_keys } = calculations;

        return (
          <InfographicPanel {...{ title, footnotes, sources, datasets }}>
            <DrrSummary
              subject={subject}
              drr_keys={drr_keys}
              verbose_counts={verbose_counts}
            />
          </InfographicPanel>
        );
      },
    }),
  });
