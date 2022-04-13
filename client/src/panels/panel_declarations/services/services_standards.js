import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  DisplayTable,
  create_text_maker_component,
  LeafSpinner,
} from "src/components/index";

import {
  useServiceSummaryGov,
  useServiceSummaryOrg,
  useServiceSummaryProgram,
} from "src/models/services/services_queries";

import { is_a11y_mode } from "src/core/injected_build_constants";

import Gauge from "src/charts/gauge";

import { get_source_links } from "src/DatasetsRoute/utils";

import text from "./services.yaml";
import "./services.scss";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesStandardsPanel = ({ subject }) => {
  const useSummaryServices = {
    gov: useServiceSummaryGov,
    dept: useServiceSummaryOrg,
    program: useServiceSummaryProgram,
  }[subject.subject_type];
  const { loading, data } = useSummaryServices({ id: subject.id });

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const {
    service_general_stats: { number_of_services, report_years },
    service_standards_summary,
  } = data;

  const { services_w_standards_count, standards_count, met_standards_count } =
    service_standards_summary[0];
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
    <div>
      <div style={{ marginBottom: "30px" }}>
        <TM
          className="medium-panel-text"
          k="services_standards_text"
          args={{ most_recent_year: report_years[0], subject }}
        />
      </div>
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
                standards_count,
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
    </div>
  );
};

export const declare_services_standards_panel = () =>
  declare_panel({
    panel_key: "services_standards",
    subject_types: ["gov", "dept", "program"],
    panel_config_func: () => ({
      get_title: () => text_maker("service_standards_title"),
      calculate: ({ subject }) => {
        return {
          subject,
        };
      },
      footnotes: false,
      source: () => get_source_links(["service_inventory"]),
      render({ title, subject, sources }) {
        return (
          <InfographicPanel title={title} sources={sources}>
            <ServicesStandardsPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
