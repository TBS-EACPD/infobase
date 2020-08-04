import "./services.scss";
import text from "./services.yaml";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoPie,
  newIBCategoryColors,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesStandardsPanel = ({ panel_args }) => {
  const { services } = panel_args;
  const colors = d3
    .scaleOrdinal()
    .domain(["positive", "negative"])
    .range(_.take(newIBCategoryColors, 2));

  const has_standards_count = _.chain(services)
    .countBy("standards")
    .filter((value, key) => key)
    .map()
    .sum()
    .value();
  const has_standards_data = [
    {
      id: "positive",
      label: text_maker("has_standards"),
      value: has_standards_count,
    },
    {
      id: "negative",
      label: text_maker("no_standards"),
      value: services.length - has_standards_count,
    },
  ];
  const standards_met_count = _.chain(services)
    .flatMap("standards")
    .flatMap("standard_report")
    .countBy("is_target_met")
    .value();
  const standards_met_data = [
    {
      id: "positive",
      label: text_maker("target_met_true"),
      value: standards_met_count.true || 0,
    },
    {
      id: "negative",
      label: text_maker("target_met_false"),
      value: standards_met_count.false || 0,
    },
  ];
  const nivo_common_props = {
    is_money: false,
    colorBy: (d) => colors(d.id),
  };

  return (
    <div className={"col-container"}>
      <div className="fcol-md-6 p-20">
        <TM className="double-pie-text" k="has_standards_text" el="h4" />
        <WrappedNivoPie
          {...nivo_common_props}
          custom_legend_items={_.map(has_standards_data, (row) => ({
            ...row,
            color: colors(row.id),
          }))}
          data={has_standards_data}
        />
      </div>
      <div className="fcol-md-6 p-20">
        <TM className="double-pie-text" k="target_met_text" el="h4" />
        <WrappedNivoPie
          {...nivo_common_props}
          custom_legend_items={_.map(standards_met_data, (row) => ({
            ...row,
            color: colors(row.id),
          }))}
          data={standards_met_data}
        />
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
            title={text_maker("services_standards")}
            sources={sources}
          >
            <ServicesStandardsPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
