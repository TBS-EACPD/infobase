import { Fragment } from "react";
import MediaQuery from "react-responsive";

import {
  run_template,
  year_templates,
  actual_to_planned_gap_year,
  WrappedNivoLine,
  newIBCategoryColors,
  trivial_text_maker,
} from "../../shared.js";

const { std_years, planning_years } = year_templates;

export const format_and_get_fte = (type, info, subject) => {
  const colors = d3.scaleOrdinal().range(newIBCategoryColors);
  const series_labels = [
    trivial_text_maker("actual_ftes"),
    trivial_text_maker("planned_ftes"),
  ];
  const history_ticks = _.map(std_years, run_template);
  const plan_ticks = _.map(planning_years, run_template);

  const gap_year =
    (subject.has_planned_spending && actual_to_planned_gap_year) || null;

  const history_data_index = _.map(
    std_years,
    (std_year) => `${subject.level}_fte_${std_year.replace(/{|}/g, "")}`
  );
  const planned_data_index = _.map(
    planning_years,
    (planned_year) => `${subject.level}_fte_${planned_year.replace(/{|}/g, "")}`
  );

  const planned_fte_exists =
    0 !=
    _.reduce(planned_data_index, (fte_sum, index) => fte_sum + info[index], 0);

  const raw_data = _.concat(
    _.map(history_data_index, (idx) => info[idx]),
    _.map(planned_data_index, (idx) => info[idx])
  );

  const prepare_graph_data = (data, data_index, years) =>
    _.chain(data_index)
      .zipWith(years, data_index, (idx, year) => ({
        x: year,
        y: data[idx],
      }))
      .pickBy((prepared_row) => {
        if (years === history_ticks) {
          return prepared_row.y > 0;
        } else {
          return true;
        }
      })
      .map((filtered_row) => filtered_row)
      .value();

  const historical_graph_data = prepare_graph_data(
    info,
    history_data_index,
    history_ticks
  );
  const planned_graph_data =
    planned_fte_exists &&
    _.compact([
      gap_year &&
        historical_graph_data.length > 0 && {
          x: gap_year,
          y: null,
        },
      ...prepare_graph_data(info, planned_data_index, plan_ticks),
    ]);
  const graph_data = _.chain(series_labels)
    .zip([historical_graph_data, planned_graph_data])
    .filter(([id, formatted_data_array]) => formatted_data_array.length > 0)
    .map(([id, data]) => ({ id, data }))
    .value();

  const shouldTickRender = (tick) => {
    if (type === "hist" || type === "hist_estimates") {
      return tick === _.first(history_ticks) || tick === _.last(history_ticks);
    } else if (type === "planned") {
      return tick === _.first(plan_ticks) || tick === _.last(plan_ticks);
    } else {
      return (
        tick === gap_year ||
        tick === _.first(history_ticks) ||
        tick === _.last(plan_ticks)
      );
    }
  };

  const nivo_fte_props = {
    data: graph_data,
    raw_data: raw_data,
    is_money: false,
    colorBy: (d) => colors(d.id),
    enableGridY: false,
    remove_left_axis: true,
    disable_y_axis_zoom: true,
    disable_table_view: true,
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
              stroke: window.infobase_color_constants.tertiaryColor,
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
