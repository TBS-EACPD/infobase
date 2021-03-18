import _ from "lodash";
import React from "react";

import { useGQLReactQuery } from "src/models/react_query_services.js";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoPie,
  util_components,
} from "../shared.js";

import text from "./services.yaml";

const { DisplayTable } = util_components;
const { text_maker, TM } = create_text_maker_component(text);

const service_fragments = "service_type";

const ServicesTypesPanel = ({ panel_args }) => {
  const { subject } = panel_args;
  const { isLoading, data } = useGQLReactQuery({
    subject,
    key: `services_types_${subject.id}`,
    fetch_all_orgs: subject.level === "gov",
    service_fragments,
  });
  if (isLoading) {
    return <span>loading</span>;
  }

  const processed_data = _.chain(data)
    .flatMap("service_type")
    .countBy()
    .map((value, type) => ({
      id: type,
      label: type,
      value,
    }))
    .value();
  const max_type = _.maxBy(processed_data, "value");

  return (
    <div>
      <TM
        args={{
          num_of_types: processed_data.length,
          subject,
          max_type: max_type.label,
          max_type_count: max_type.value,
          num_of_services: data.length,
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
          data={processed_data}
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
          data={processed_data}
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
      requires_services: true,
      calculate: (subject) => {
        return {
          subject,
        };
      },
      footnotes: false,
      render({ calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("service_types")}
            sources={sources}
          >
            <ServicesTypesPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
