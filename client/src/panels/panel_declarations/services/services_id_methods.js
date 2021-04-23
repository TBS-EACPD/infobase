import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  DisplayTable,
  create_text_maker_component,
} from "src/components/index.js";

import { useSummaryServices } from "src/models/populate_services.js";

import { newIBCategoryColors } from "src/core/color_schemes.js";
import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index.js";

import text from "./services.yaml";
import "./services.scss";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesIdMethodsPanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `
    service_id_methods_summary {
      id
      method
      label
      value
    }`,
  });
  if (loading) {
    return <span>loading</span>;
  }
  const { service_id_methods_summary } = data;
  const sin_data = _.chain(service_id_methods_summary)
    .filter({ method: "sin" })
    .map((row) => ({
      ...row,
      label: text_maker(row.label),
    }))
    .value();
  const cra_data = _.chain(service_id_methods_summary)
    .filter({ method: "cra" })
    .map((row) => ({
      ...row,
      label: text_maker(row.label),
    }))
    .value();

  const colors = scaleOrdinal()
    .domain(["uses_identifier", "does_not_identifier", "na"])
    .range(_.take(newIBCategoryColors, 3));

  const nivo_common_props = {
    is_money: false,
    colors: (d) => colors(d.id),
  };
  const column_configs = {
    label: {
      index: 0,
      header: text_maker("identification_methods"),
    },
    value: {
      index: 1,
      header: text_maker("value"),
    },
  };

  return (
    <div className={"col-container"}>
      <div className="col-12 col-lg-6 p-20">
        <TM className="double-pie-text" k="sin_sub_title" el="h4" />
        {is_a11y_mode ? (
          <DisplayTable data={sin_data} column_configs={column_configs} />
        ) : (
          <WrappedNivoPie
            {...nivo_common_props}
            custom_legend_items={_.map(sin_data, (row) => ({
              ...row,
              color: colors(row.id),
            }))}
            data={sin_data}
          />
        )}
      </div>
      <div className="col-12 col-lg-6 p-20">
        <TM className="double-pie-text" k="cra_sub_title" el="h4" />
        {is_a11y_mode ? (
          <DisplayTable data={cra_data} column_configs={column_configs} />
        ) : (
          <WrappedNivoPie
            {...nivo_common_props}
            custom_legend_items={_.map(cra_data, (row) => ({
              ...row,
              color: colors(row.id),
            }))}
            data={cra_data}
          />
        )}
      </div>
    </div>
  );
};

export const declare_services_id_methods_panel = () =>
  declare_panel({
    panel_key: "services_id_methods",
    levels: ["gov", "dept", "program"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("identification_methods"),
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
            <ServicesIdMethodsPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
