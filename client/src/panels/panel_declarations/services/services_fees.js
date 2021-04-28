import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  DisplayTable,
  create_text_maker_component,
  SpinnerWrapper,
} from "src/components/index.js";

import { useSummaryServices } from "src/models/populate_services.js";

import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index.js";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesFeesPanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `
    service_fees_summary {
      id
      label
      value
    }`,
  });
  if (loading) {
    return <SpinnerWrapper config_name="inline_panel" />;
  }
  const {
    service_general_stats: { number_of_services },
    service_fees_summary,
  } = data;

  const processed_fees_summary = _.map(service_fees_summary, (row) => ({
    ...row,
    label: text_maker(row.label),
  }));
  return (
    <div>
      <TM
        k={
          subject.level === "program"
            ? "services_prog_fees_text"
            : "services_fees_text"
        }
        args={{
          subject_name: subject.name,
          services_count: number_of_services,
          charge_fees_count: _.find(service_fees_summary, {
            label: "service_charges_fees",
          }).value,
        }}
        className="medium-panel-text"
      />
      {is_a11y_mode ? (
        <DisplayTable
          data={processed_fees_summary}
          column_configs={{
            label: {
              index: 0,
              header: text_maker("services_fees"),
            },
            value: {
              index: 1,
              header: text_maker("value"),
            },
          }}
        />
      ) : (
        <WrappedNivoPie data={processed_fees_summary} is_money={false} />
      )}
    </div>
  );
};

export const declare_services_fees_panel = () =>
  declare_panel({
    panel_key: "services_fees",
    levels: ["gov", "dept", "program"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("services_fees"),
      calculate: (subject) => {
        return {
          subject,
        };
      },
      footnotes: false,
      render({ title, calculations, sources }) {
        const { subject } = calculations;
        return (
          <InfographicPanel title={title} sources={sources}>
            <ServicesFeesPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
