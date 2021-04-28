import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  DisplayTable,
  create_text_maker_component,
} from "src/components/index.js";

import { useSummaryServices } from "src/models/populate_services.js";

import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import Gauge from "src/charts/gauge.js";

import text from "./services.yaml";
import "./services.scss";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesStandardsPanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `
    service_standards_summary {
      id
      standards_count
      met_standards_count
      services_w_standards_count
    }`,
  });
  if (loading) {
    return <span>loading</span>;
  }
  const {
    service_general_stats: { number_of_services },
    service_standards_summary,
  } = data;

  const {
    services_w_standards_count,
    standards_count,
    met_standards_count,
  } = service_standards_summary[0];
  const not_met_standards_count = standards_count - met_standards_count;

  const common_column_configs = {
    value: {
      index: 1,
      header: text_maker("value"),
    },
    pct: {
      index: 2,
      header: text_maker("percentage"),
      formatter: "percentage1",
    },
  };

  return (
    <div className={"col-container"}>
      <div className="services-standards-gauge-container col-12 col-lg-6 p-20">
        <TM className="double-pie-text" k="has_standards_text" el="h4" />
        {is_a11y_mode ? (
          <DisplayTable
            data={[
              {
                id: text_maker("no_standards"),
                value: number_of_services - services_w_standards_count,
                pct:
                  (number_of_services - services_w_standards_count) /
                    number_of_services || 0,
              },
              {
                id: text_maker("has_standards"),
                value: services_w_standards_count,
                pct: services_w_standards_count / number_of_services || 0,
              },
            ]}
            column_configs={{
              ...common_column_configs,
              id: {
                index: 0,
                header: text_maker("has_standards_table_text"),
              },
            }}
          />
        ) : (
          <Gauge
            value={services_w_standards_count}
            total_value={number_of_services}
            show_pct={false}
          />
        )}
        <h2>
          <TM
            k="gauge_has_standards_text"
            args={{
              has_standards_pct:
                services_w_standards_count / number_of_services || 0,
            }}
          />
        </h2>
      </div>
      <div className="services-standards-gauge-container col-12 col-lg-6 p-20">
        <TM className="double-pie-text" k="target_met_text" el="h4" />
        {is_a11y_mode ? (
          <DisplayTable
            column_configs={{
              ...common_column_configs,
              id: {
                index: 0,
                header: text_maker("target_met_table_text"),
              },
            }}
            data={[
              {
                id: text_maker("target_met_false"),
                value: not_met_standards_count,
                pct: not_met_standards_count / standards_count || 0,
              },
              {
                id: text_maker("target_met_true"),
                value: met_standards_count || 0,
                pct: (met_standards_count || 0) / standards_count || 0,
              },
            ]}
          />
        ) : (
          <Gauge
            value={met_standards_count || 0}
            total_value={standards_count}
            show_pct={false}
          />
        )}
        <h2>
          <TM
            k="gauge_standards_met_text"
            args={{
              standards_met_pct:
                (met_standards_count || 0) / standards_count || 0,
            }}
          />
        </h2>
      </div>
    </div>
  );
};

export const declare_services_standards_panel = () =>
  declare_panel({
    panel_key: "services_standards",
    levels: ["gov", "dept", "program"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("service_standards_title"),
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
            <ServicesStandardsPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
