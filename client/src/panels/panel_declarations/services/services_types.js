import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  DisplayTable,
  create_text_maker_component,
} from "src/components/index.js";

import { Service } from "src/models/services.js";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index.js";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesTypesPanel = ({ panel_args }) => {
  const { services, subject } = panel_args;
  const data = _.chain(services)
    .flatMap("service_type")
    .countBy()
    .map((value, type) => ({
      id: type,
      label: type,
      value,
    }))
    .value();
  const max_type = _.maxBy(data, "value");

  return (
    <div>
      <TM
        args={{
          num_of_types: data.length,
          subject,
          max_type: max_type.label,
          max_type_count: max_type.value,
          num_of_services: services.length,
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
          data={data}
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
        <WrappedNivoPie data={data} include_percent={false} is_money={false} />
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
      requires_services: true,
      calculate: (subject) => {
        const services = {
          dept: Service.get_by_dept(subject.id),
          program: Service.get_by_prog(subject.id),
          gov: Service.get_all(),
        };
        return {
          subject,
          services: services[level],
        };
      },
      footnotes: false,
      render({ title, calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel title={title} sources={sources}>
            <ServicesTypesPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
