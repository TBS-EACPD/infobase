import {
  ResponsiveCirclePacking,
  useNodeMouseHandlers,
} from "@nivo/circle-packing";
import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import MediaQuery from "react-responsive";

import { DisplayTable } from "src/components/index";

import { newIBCategoryColors } from "src/core/color_schemes";

import { formats } from "src/core/format";

import {
  InteractiveGraph,
  create_text_maker_component_with_nivo_common,
  general_default_props,
  get_formatter,
} from "src/charts/wrapped_nivo/wrapped_nivo_common";
import {
  textColor,
  minMediumDevice,
  maxMediumDevice,
} from "src/style_constants/index";

import text from "./WrappedNivoCircleProportion.yaml";
import "./WrappedNivoCircleProportion.scss";

const { text_maker, TM } = create_text_maker_component_with_nivo_common(text);

export class WrappedNivoCircleProportion extends React.Component {
  render() {
    const {
      is_money,
      formatter,
      height,
      child_value,
      child_name,
      parent_value,
      parent_name,
      disable_table_view,
      table_name,
    } = this.props;

    const color_scale = scaleOrdinal().range(newIBCategoryColors);
    const value_formatter = get_formatter(is_money, formatter, true, false);

    const Circles = () => {
      // arbitrary parent values
      const minX = 350;
      const minY = 350;
      const parent_radius = minX - 330;
      const parent_cx = 175;
      const parent_cy = 25;

      // child circle calculations
      const child_percent = child_value / parent_value;
      const child_radius = parent_radius * child_percent;

      return (
        <svg
          viewBox={
            -parent_cx.toString() +
            " " +
            -parent_cy.toString() +
            " " +
            minX.toString() +
            " " +
            minY.toString()
          }
        >
          <circle
            r={parent_radius.toString()}
            fill={color_scale(parent_name)}
          />
          <circle
            cy={(parent_radius - child_radius).toString()}
            r={child_radius.toString()}
            fill={color_scale(child_name)}
            style={{ zIndex: 1 }}
          />
        </svg>
      );
    };

    const Table = () => {
      return (
        <div>
          <tr>
            <td className="nivo-tooltip__label">{parent_name}</td>
            <td className="nivo-tooltip__value">
              {value_formatter(parent.value)}
            </td>
            <td className="nivo-tooltip__value">
              {`(${formats.smart_percentage1_raw(
                parent_value / parent_value
              )})`}
              <svg height="50px">
                <circle
                  cx="20"
                  cy="25"
                  r="10"
                  fill={color_scale(parent_name)}
                />
              </svg>
            </td>
          </tr>
          <tr>
            <td className="nivo-tooltip__label">{child_name}</td>
            <td className="nivo-tooltip__value">
              {value_formatter(parent.value)}
            </td>
            <td className="nivo-tooltip__value">
              {`(${formats.smart_percentage1_raw(child_value / parent_value)})`}
              <svg height="50px">
                <circle cx="20" cy="25" r="10" fill={color_scale(child_name)} />
              </svg>
            </td>
          </tr>
        </div>
      );
    };

    const graph = (
      <Fragment>
        <div style={{ height: height }}>
          <Circles />
        </div>
        <div style={{ textAlign: "center" }}>
          <TM
            k={"bubble_title"}
            args={{ outer: parent_name, inner: child_name }}
          />
        </div>
        <Table />
      </Fragment>
    );

    const column_configs = _.chain(["label", "value"])
      .map((key, idx) => [
        key,
        {
          index: idx,
          header: text_maker(key),
          formatter: (value) =>
            _.isUndefined(value) ? "" : value_formatter(value),
        },
      ])
      .fromPairs()
      .value();
    const table_data = [
      { label: parent_name, value: parent_value },
      { label: child_name, value: child_value },
    ];
    const table = !disable_table_view && (
      <DisplayTable
        table_name={table_name || text_maker("default_table_name")}
        column_configs={column_configs}
        data={table_data}
      />
    );

    return <InteractiveGraph graph={graph} table={table} />;
  }
}
WrappedNivoCircleProportion.defaultProps = {
  ...general_default_props,
  margin: { top: 15, right: 0, bottom: 15, left: 0 },
};
