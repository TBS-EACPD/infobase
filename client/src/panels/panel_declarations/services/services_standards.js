import "./services.scss";
import text from "./services.yaml";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
} from "../shared.js";
import Gauge from "../../../charts/gauge.js";
import { DisplayTable } from "../../../components";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesStandardsPanel = ({ panel_args }) => {
  const { services } = panel_args;

  const has_standards_count = _.chain(services)
    .countBy("standards")
    .filter((value, key) => key)
    .map()
    .sum()
    .value();
  const total_flat_standards = _.chain(services)
    .flatMap("standards")
    .reject(({ target_type }) => target_type === "Other type of target")
    .flatMap("standard_report")
    .filter("count" || "lower" || "met_count")
    .value();
  const standards_met_count = _.countBy(total_flat_standards, "is_target_met");
  const standards_met_value = standards_met_count.true || 0;
  const standards_not_met_value = standards_met_count.false || 0;

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
      <div className="services-standards-gauge-container fcol-md-6 p-20">
        <TM className="double-pie-text" k="has_standards_text" el="h4" />
        {window.is_a11y_mode ? (
          <DisplayTable
            data={[
              {
                id: text_maker("no_standards"),
                value: services.length - has_standards_count,
                pct:
                  (services.length - has_standards_count) / services.length ||
                  0,
              },
              {
                id: text_maker("has_standards"),
                value: has_standards_count,
                pct: has_standards_count / services.length || 0,
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
            value={has_standards_count}
            total_value={services.length}
            show_pct={false}
          />
        )}
        <h2>
          <TM
            k="gauge_has_standards_text"
            args={{
              has_standards_pct: has_standards_count / services.length || 0,
            }}
          />
        </h2>
      </div>
      <div className="services-standards-gauge-container fcol-md-6 p-20">
        <TM className="double-pie-text" k="target_met_text" el="h4" />
        {window.is_a11y_mode ? (
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
                value: standards_not_met_value,
                pct: standards_not_met_value / total_flat_standards.length || 0,
              },
              {
                id: text_maker("target_met_true"),
                value: standards_met_value,
                pct: standards_met_value / total_flat_standards.length || 0,
              },
            ]}
          />
        ) : (
          <Gauge
            value={standards_met_value}
            total_value={total_flat_standards.length}
            show_pct={false}
          />
        )}
        <h2>
          <TM
            k="gauge_standards_met_text"
            args={{
              standards_met_pct:
                standards_met_value / total_flat_standards.length || 0,
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
    levels: ["dept", "gov"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: (subject) => ({
        subject,
        services:
          level === "dept"
            ? Service.get_by_dept(subject.id)
            : Service.get_all(),
      }),
      footnotes: false,
      render({ calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("service_standards_title")}
            sources={sources}
          >
            <ServicesStandardsPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
