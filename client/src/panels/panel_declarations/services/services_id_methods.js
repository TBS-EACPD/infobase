import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  DisplayTable,
  create_text_maker_component,
} from "src/components/index.js";

import { Service } from "src/models/services.js";

import { newIBCategoryColors } from "src/core/color_schemes.ts";
import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index.js";

import text from "./services.yaml";
import "./services.scss";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesIdMethodsPanel = ({ panel_args }) => {
  const services = panel_args.services;
  const colors = scaleOrdinal()
    .domain(["uses_identifier", "does_not_identifier", "na"])
    .range(_.take(newIBCategoryColors, 3));
  const get_id_method_count = (method) =>
    _.reduce(
      services,
      (sum, service) => {
        const service_id_count = _.countBy(service.service_report, method);
        return {
          true: sum.true + service_id_count.true || sum.true,
          false: sum.false + service_id_count.false || sum.false,
          null: sum.null + service_id_count.null || sum.null,
        };
      },
      {
        true: 0,
        false: 0,
        null: 0,
      }
    );

  const sin_count = get_id_method_count("sin_collected");
  const cra_count = get_id_method_count("cra_business_ids_collected");

  const sin_data = [
    {
      id: "uses_identifier",
      label: text_maker("uses_sin_as_identifier"),
      value: sin_count.true,
    },
    {
      id: "does_not_identifier",
      label: text_maker("does_not_use_sin_as_identifier"),
      value: sin_count.false,
    },
    {
      id: "na",
      label: text_maker("sin_not_applicable"),
      value: sin_count.null,
    },
  ];
  const cra_data = [
    {
      id: "uses_identifier",
      label: text_maker("uses_cra_as_identifier"),
      value: cra_count.true,
    },
    {
      id: "does_not_identifier",
      label: text_maker("does_not_use_cra_as_identifier"),
      value: cra_count.false,
    },
    {
      id: "na",
      label: text_maker("cra_not_applicable"),
      value: cra_count.null,
    },
  ];

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
            <ServicesIdMethodsPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
