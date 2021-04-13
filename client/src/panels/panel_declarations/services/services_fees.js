import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  DisplayTable,
  create_text_maker_component,
} from "src/components/index.js";

import { useServices } from "src/models/populate_services.js";

import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index.js";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesFeesPanel = ({ subject }) => {
  const { loading, data } = useServices({
    subject,
    service_fragments: `collects_fees`,
  });
  if (loading) {
    return <span>loading</span>;
  }

  const service_charges_fees = _.countBy(data, "collects_fees");
  const processed_data = [
    {
      id: "fees",
      label: text_maker("service_charges_fees"),
      value: service_charges_fees.true || 0,
    },
    {
      id: "no_fees",
      label: text_maker("service_does_not_charge_fees"),
      value: service_charges_fees.false || 0,
    },
  ];
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
          services_count: data.length,
          charge_fees_count: service_charges_fees.true || 0,
        }}
        className="medium-panel-text"
      />
      {is_a11y_mode ? (
        <DisplayTable
          data={processed_data}
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
        <WrappedNivoPie data={processed_data} is_money={false} />
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
