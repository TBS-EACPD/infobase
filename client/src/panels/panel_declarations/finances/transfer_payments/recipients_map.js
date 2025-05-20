import { scaleLinear } from "d3-scale";
import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { RecipientSummary } from "src/models/recipients/RecipientsSummaryDataStore";

import { formats } from "src/core/format";

import { Canada } from "src/charts/canada/index";

import { text_maker, TM } from "./gnc_text_provider";

const formatter = formats["compact2_raw"];

const no_data_or_na_to_null = (value) =>
  value === "Not Available" || value === null ? 0 : value;

const RecipientsPanel = ({ calculations }) => {
  const { data, years } = calculations;

  const cleaned_data = _.chain(data)
    .map(({ year, __typename, ...other_fields }) =>
      _.chain(other_fields)
        .map((value, key) => [key, no_data_or_na_to_null(value)])
        .fromPairs()
        .value()
    )
    .value();
  const max = _.chain(cleaned_data).last().values().max().value();
  const color_scale = scaleLinear().domain([0, max]).range([0.2, 1]);

  const map_calculations = {
    years: years,
    data: cleaned_data,
    formatter,
    color_scale: color_scale,
  };

  return (
    <div>
      <div className="fcol-xs-12 fcol-md-4">
        <TM className="medium-panel-text" k={`recipient_map_text`} />
      </div>
      <div className="fcol-xs-12 fcol-md-8">
        <div style={{ padding: "25px 0px 0px 0px" }}>
          <Canada graph_args={map_calculations} />
        </div>
      </div>
    </div>
  );
};

export const declare_recipients_map_panel = () =>
  declare_panel({
    panel_key: "recipients_map",
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      legacy_non_table_dependencies: ["requires_recipients_general_stats"],
      get_dataset_keys: () => ["recipients"],
      calculate: ({ subject }) => {
        const data = RecipientSummary.lookup(subject.id).recipient_location;

        const years = _.map(data, "year");

        return { data, years };
      },
      get_title: () => text_maker("recipient_map_title"),
      render({ title, subject, sources, calculations }) {
        return (
          <InfographicPanel {...{ title, sources }}>
            <RecipientsPanel subject={subject} calculations={calculations} />
          </InfographicPanel>
        );
      },
    }),
  });
