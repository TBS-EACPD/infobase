import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import { run_template, trivial_text_maker } from "src/models/text.js";
import {
  year_templates,
  actual_to_planned_gap_year,
} from "src/models/years.js";

import { tertiaryColor } from "src/core/color_defs.js";
import { newIBCategoryColors } from "src/core/color_schemes.js";
import { is_a11y_mode } from "src/core/injected_build_constants";
import { Table } from "src/core/TableClass.js";

import { WrappedNivoLine } from "src/charts/wrapped_nivo/index.js";

const { std_years, planning_years } = year_templates;

export const format_and_get_fte = (type, subject) => {
  const colors = scaleOrdinal().range(newIBCategoryColors);

  const gap_year =
    (subject.has_planned_spending && actual_to_planned_gap_year) || null;

  const series_labels = [
    trivial_text_maker("actual_ftes"),
    trivial_text_maker("planned_ftes"),
  ];
  const historical_ticks = _.map(std_years, run_template);
  const planned_ticks = _.map(planning_years, run_template);

  const programFtes = Table.lookup("programFtes");
  const q = programFtes.q(subject);

  const historical_ftes = _.chain(std_years)
    .map((year, i) => [historical_ticks[i], q.sum(year, i)])
    .fromPairs()
    .value();
  const planned_ftes = _.chain(planning_years)
    .map((year, i) => [planned_ticks[i], q.sum(year, i)])
    .fromPairs()
    .value();

  const raw_data = _.concat(_.map(historical_ftes), _.map(planned_ftes));

  const historical_graph_data = _.chain(historical_ftes)
    .map((value, year) => ({ x: year, y: value }))
    .dropWhile((row) => row && row.y === 0)
    .value();

  const planned_fte_exists = _.some(
    planned_ftes,
    (planned_ftes_value) => planned_ftes_value != 0
  );
  const planned_graph_data =
    planned_fte_exists &&
    _.compact([
      gap_year &&
        historical_graph_data.length > 0 && {
          x: gap_year,
          y: null,
        },
      ..._.map(planned_ftes, (value, year) => ({
        x: year,
        y: value,
      })),
    ]);

  const graph_data = _.chain(series_labels)
    .zip([historical_graph_data, planned_graph_data])
    .filter(([id, formatted_data_array]) => formatted_data_array.length > 0)
    .map(([id, data]) => ({ id, data }))
    .value();

  const shouldTickRender = (tick) => {
    if (type === "hist" || type === "hist_estimates") {
      return (
        tick === _.first(historical_ticks) || tick === _.last(historical_ticks)
      );
    } else if (type === "planned") {
      return tick === _.first(planned_ticks) || tick === _.last(planned_ticks);
    } else {
      return (
        tick === gap_year ||
        tick === _.first(historical_ticks) ||
        tick === _.last(planned_ticks)
      );
    }
  };

  const nivo_fte_props = {
    data: graph_data,
    raw_data: raw_data,
    is_money: false,
    colors: (d) => colors(d.id),
    enableGridY: false,
    remove_left_axis: true,
    disable_y_axis_zoom: true,
    disable_table_view: !is_a11y_mode,
    y_scale_min: _.min(raw_data) * 0.9,
    y_scale_max: _.max(raw_data) * 1.1,
    margin: {
      top: 10,
      right: 40,
      bottom: 67,
      left: 40,
    },
    graph_height: "230px",
    legends: [
      {
        anchor: "bottom-right",
        direction: "row",
        translateX: -77,
        translateY: 60,
        itemDirection: "left-to-right",
        itemWidth: 2,
        itemHeight: 20,
        itemsSpacing: 140,
        itemOpacity: 0.75,
        symbolSize: 12,
      },
    ],
    ...(gap_year &&
      graph_data.length > 1 && {
        markers: [
          {
            axis: "x",
            value: gap_year,
            lineStyle: {
              stroke: tertiaryColor,
              strokeWidth: 2,
              strokeDasharray: "3, 3",
            },
          },
        ],
      }),
  };
  const nivo_mobile_fte_props = {
    ...nivo_fte_props,
    bttm_axis: { format: (tick) => (shouldTickRender(tick) ? tick : "") },
  };
  return (
    <Fragment>
      <MediaQuery minWidth={1199}>
        <WrappedNivoLine {...nivo_fte_props} />
      </MediaQuery>
      <MediaQuery maxWidth={1198}>
        <WrappedNivoLine {...nivo_mobile_fte_props} />
      </MediaQuery>
    </Fragment>
  );
};
