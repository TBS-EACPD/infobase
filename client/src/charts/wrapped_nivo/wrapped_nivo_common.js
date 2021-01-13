import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import {
  create_text_maker_component,
  StatelessModal,
} from "src/components/index.js";

import { breakpoints } from "src/core/breakpoint_defs.js";
import {
  secondaryColor,
  backgroundColor,
  textColor,
} from "src/core/color_defs.js";
import { is_IE } from "src/core/feature_detection.js";
import { formats } from "src/core/format.js";
import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { IconTable } from "src/icons/icons.js";

import { get_formatter, infobase_colors_smart } from "../shared.js";

import graph_text from "./wrapped_nivo_common.yaml";
import "./wrapped_nivo_common.scss";

const { text_maker: nivo_common_text_maker } = create_text_maker_component(
  graph_text
);
const create_text_maker_component_with_nivo_common = (additional_text) =>
  create_text_maker_component([graph_text, additional_text]);

const fixed_symbol_shape = ({ x, y, size, fill, borderWidth, borderColor }) => (
  <rect
    x={x}
    y={y}
    transform={is_IE() ? `translate(0 -4)` : ""}
    fill={fill}
    strokeWidth={borderWidth}
    stroke={borderColor}
    width={size}
    height={size}
    style={{ pointerEvents: "none" }}
  />
);
const fix_legend_symbols = (legends) =>
  legends
    ? _.map(legends, (legend) =>
        _.chain(legend)
          .clone()
          .assign({ symbolShape: fixed_symbol_shape })
          .value()
      )
    : undefined;

const DefaultLegendIcon = ({ tooltip_item }) => (
  <td className="nivo-tooltip__legend-icon">
    <div
      className={`nivo-tooltip__icon-${tooltip_item.shape || "square"}`}
      style={{ backgroundColor: tooltip_item.color }}
    />
  </td>
);
const TooltipFactory = ({
  tooltip_items,
  tooltip_container_class,
  TooltipContentComponent,
  LegendIconComponent = DefaultLegendIcon,
}) => (
  <div className={tooltip_container_class} style={{ color: textColor }}>
    <table className="nivo-tooltip">
      <tbody>
        {tooltip_items.map((tooltip_item) => (
          <tr key={tooltip_item.id}>
            {LegendIconComponent && (
              <LegendIconComponent tooltip_item={tooltip_item} />
            )}
            <TooltipContentComponent tooltip_item={tooltip_item} />
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DefaultTooltip = ({ tooltip_items, formatter }) => (
  <TooltipFactory
    tooltip_items={tooltip_items}
    TooltipContentComponent={({ tooltip_item }) => (
      <Fragment>
        <MediaQuery minDeviceWidth={breakpoints.minSmallDevice}>
          <td className="nivo-tooltip__label">
            {tooltip_item.name || tooltip_item.id}
          </td>
          <td
            className="nivo-tooltip__value"
            dangerouslySetInnerHTML={{
              __html: formatter(tooltip_item.value),
            }}
          />
        </MediaQuery>
        <MediaQuery maxDeviceWidth={breakpoints.maxSmallDevice}>
          <td>
            <div className="nivo-tooltip__label">
              {tooltip_item.name || tooltip_item.id}
            </div>
            <div
              className="nivo-tooltip__value"
              dangerouslySetInnerHTML={{
                __html: formatter(tooltip_item.value),
              }}
            />
          </td>
        </MediaQuery>
      </Fragment>
    )}
  />
);

const DefaultPercentTooltip = ({ tooltip_items, formatter, total }) => (
  <TooltipFactory
    tooltip_items={tooltip_items}
    TooltipContentComponent={({ tooltip_item }) => (
      <Fragment>
        <MediaQuery minDeviceWidth={breakpoints.minSmallDevice}>
          <td className="nivo-tooltip__label">
            {
              /* TODO: standardize our chart APIs on either label or name. 
                  Resolve whatever dumb issue meant the full plain language name needed to be used as the id sometimes... */
              tooltip_item.name || tooltip_item.label || tooltip_item.id
            }
          </td>
          <td
            className="nivo-tooltip__value"
            dangerouslySetInnerHTML={{
              __html: formatter(tooltip_item.value),
            }}
          />
          <td
            className="nivo-tooltip__value"
            dangerouslySetInnerHTML={{
              __html: formats.percentage1(Math.abs(tooltip_item.value) / total),
            }}
          />
        </MediaQuery>
        <MediaQuery maxDeviceWidth={breakpoints.maxSmallDevice}>
          <td>
            <div className="nivo-tooltip__label">
              {tooltip_item.name || tooltip_item.label || tooltip_item.id}
            </div>
            <div
              className="nivo-tooltip__value"
              dangerouslySetInnerHTML={{
                __html: formatter(tooltip_item.value),
              }}
            />
            <div
              className="nivo-tooltip__value"
              dangerouslySetInnerHTML={{
                __html: formats.percentage1(
                  Math.abs(tooltip_item.value) / total
                ),
              }}
            />
          </td>
        </MediaQuery>
      </Fragment>
    )}
  />
);

// TODO: refactor this...
class InteractiveGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_table: false,
    };
  }

  render() {
    const { show_table } = this.state;

    const { graph, table, table_name, other_buttons } = this.props;

    return !is_a11y_mode ? (
      <Fragment>
        <div>
          {/* don't remove this div: btn-ib-array requires a parent to determine its 
          position as a child which allows for the pseudo-classes :first-child
          and :last-child to be added to the required buttons*/}
          {table && (
            <button
              className={classNames("btn-ib-primary", "btn-ib-array")}
              style={{
                zIndex: 999,
              }}
              onClick={() => this.setState({ show_table: !show_table })}
            >
              <IconTable
                title={nivo_common_text_maker("show_table")}
                color={secondaryColor}
                alternate_color={backgroundColor}
              />
            </button>
          )}
          {_.map(other_buttons, (button, i) => (
            <Fragment key={i}>{button}</Fragment> //Keep this fragment, it is used to give button a key
          ))}
        </div>
        {graph}
        <StatelessModal
          show={show_table}
          title={table_name || nivo_common_text_maker("default_table_name")}
          body={table}
          on_close_callback={() => this.setState({ show_table: false })}
          additional_dialog_class={"modal-responsive"}
        />
      </Fragment>
    ) : (
      table
    );
  }
}

const general_default_props = {
  tooltip: (d, formatter) => (
    <DefaultTooltip tooltip_items={d} formatter={formatter} />
  ),
  percent_value_tooltip: (d, formatter, total) => (
    <DefaultPercentTooltip
      tooltip_items={d}
      formatter={formatter}
      total={total}
    />
  ),
  is_money: true,
  remove_bottom_axis: false,
  remove_left_axis: false,
  add_top_axis: false,
  enableLabel: false,
  enableGridX: true,
  enableGridY: true,
  disable_table_view: false,
  margin: {
    top: 50,
    right: 40,
    bottom: 50,
    left: 70,
  },
  graph_height: "400px",
  theme: {
    axis: {
      ticks: {
        text: {
          fontSize: 12,
          fill: textColor,
        },
      },
    },
    legends: {
      text: {
        fontSize: 12,
      },
    },
  },
  isInteractive: true,
  motionDamping: 15,
  motionStiffness: 95,
};

export {
  InteractiveGraph,
  TooltipFactory,
  DefaultTooltip,
  DefaultPercentTooltip,
  general_default_props,
  nivo_common_text_maker,
  create_text_maker_component_with_nivo_common,
  get_formatter,
  infobase_colors_smart,
  fix_legend_symbols,
};
