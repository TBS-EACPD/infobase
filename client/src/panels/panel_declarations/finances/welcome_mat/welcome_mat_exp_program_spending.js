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
import { is_a11y_mode } from "src/core/injected_build_constants.js";
import { Table } from "src/core/TableClass.js";

import { WrappedNivoLine } from "src/charts/wrapped_nivo/index.js";

const { std_years, planning_years } = year_templates;
const exp_cols = _.map(std_years, (yr) => `${yr}exp`);

const calculate = (type, subject) => {
  const orgVoteStatPa = Table.lookup("orgVoteStatPa");
  const programSpending = Table.lookup("programSpending");
  const query_subject = subject.is("gov") ? undefined : subject;
  const qExp = subject.is("dept")
    ? type != "planned"
      ? orgVoteStatPa.q(query_subject)
      : null
    : programSpending.q(query_subject);
  const exp = qExp && qExp.sum(exp_cols, { as_object: false });

  const qProgSpending =
    type != "hist" ? programSpending.q(query_subject) : null;
  const progSpending =
    qProgSpending && subject.has_planned_spending
      ? qProgSpending.sum(planning_years, { as_object: false })
      : null;

  return { exp, progSpending };
};

export const format_and_get_exp_program_spending = (type, subject) => {
  const colors = scaleOrdinal().range(newIBCategoryColors);
  const { exp, progSpending } = calculate(type, subject);
  const raw_data = _.concat(exp, progSpending);

  const exp_exists =
    exp && 0 != _.reduce(exp, (exp_sum, value) => exp_sum + value, 0);
  const program_spending_exists =
    progSpending &&
    0 !=
      _.reduce(
        progSpending,
        (progSpending_sum, value) => progSpending_sum + value,
        0
      );
  const both_exists = exp_exists && program_spending_exists;

  const series_labels = [
    exp_exists ? trivial_text_maker("expenditures") : null,
    program_spending_exists ? trivial_text_maker("planned_spending") : null,
  ];

  const history_ticks = _.map(std_years, run_template);
  const plan_ticks = _.map(planning_years, run_template);

  const gap_year =
    (subject.has_planned_spending && actual_to_planned_gap_year) || null;

  const zip_years_and_data = (years, data) =>
    _.chain(years)
      .map((year, year_ix) => {
        if (data) {
          return {
            x: year,
            y: data[year_ix],
          };
        }
      })
      .dropWhile((row) => row && row.y === 0)
      .value();
  const graph_data = _.chain(series_labels)
    .zip([
      zip_years_and_data(history_ticks, exp),
      _.compact([
        gap_year &&
          both_exists && {
            x: gap_year,
            y: null,
          },
        ...zip_years_and_data(plan_ticks, progSpending),
      ]),
    ])
    .filter((row) => !_.isNull(row[0]))
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

  const nivo_exp_program_spending_props = {
    raw_data: raw_data,
    data: graph_data,
    colors: (d) => colors(d.id),
    enableGridY: false,
    remove_left_axis: true,
    disable_y_axis_zoom: true,
    disable_table_view: !is_a11y_mode,
    y_scale_min: _.min(raw_data) * 0.9,
    y_scale_max: _.max(raw_data) * 1.1,
    legends: [
      {
        anchor: "bottom-right",
        direction: "row",
        translateX: -80,
        translateY: 60,
        itemDirection: "left-to-right",
        itemWidth: 2,
        itemHeight: 20,
        itemsSpacing: 160,
        itemOpacity: 0.75,
        symbolSize: 12,
      },
    ],
    margin: {
      top: 10,
      right: 40,
      bottom: 70,
      left: 40,
    },
    graph_height: "230px",
    ...(gap_year &&
      both_exists &&
      _.includes(series_labels, trivial_text_maker("planned_spending")) && {
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
  const nivo_mobile_exp_program_spending_props = {
    ...nivo_exp_program_spending_props,
    bttm_axis: { format: (tick) => (shouldTickRender(tick) ? tick : "") },
  };
  return (
    <Fragment>
      <MediaQuery minWidth={1199}>
        <WrappedNivoLine {...nivo_exp_program_spending_props} />
      </MediaQuery>
      <MediaQuery maxWidth={1198}>
        <WrappedNivoLine {...nivo_mobile_exp_program_spending_props} />
      </MediaQuery>
    </Fragment>
  );
};
