import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  DisplayTable,
  create_text_maker_component,
} from "src/components/index.js";

import { useSummaryServices } from "src/models/populate_services.js";

import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index.js";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesTypesPanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `
    service_type_summary {
      id
      label
      value
    }`,
  });
  if (loading) {
    return <span>loading</span>;
  }
  const { service_general_stats, service_type_summary } = data;
  const max_type = _.maxBy(service_type_summary, "value");

  return (
    <div>
      <TM
        args={{
          num_of_types: service_type_summary.length,
          subject,
          max_type: max_type.label,
          max_type_count: max_type.value,
          num_of_services: service_general_stats.number_of_services,
        }}
        className="medium-panel-text"
        k={
          subject.level === "program"
            ? "services_types_prog_desc"
            : "services_types_desc"
        }
      />
      {is_a11y_mode ? (
        <DisplayTable
          data={service_type_summary}
          column_configs={{
            label: {
              index: 0,
              header: text_maker("service_types"),
              is_searchable: true,
            },
            value: {
              index: 1,
              header: text_maker("value"),
            },
          }}
        />
      ) : (
        <WrappedNivoPie
          id={"label"}
          data={service_type_summary}
          include_percent={false}
          is_money={false}
        />
      )}
    </div>
  );
};

export const declare_services_types_panel = () =>
  declare_panel({
    panel_key: "services_types",
    levels: ["gov", "dept", "program"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("service_types"),
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
            <ServicesTypesPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
