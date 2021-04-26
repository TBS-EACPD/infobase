import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import {
  StdPanel,
  Col,
} from "src/panels/panel_declarations/InfographicPanel.js";

import { create_text_maker_component } from "src/components/index.js";

import { businessConstants } from "src/models/businessConstants.js";
import { run_template } from "src/models/text.js";
import { year_templates } from "src/models/years.js";

import { formats } from "src/core/format.js";

import { NivoLineBarToggle } from "src/charts/wrapped_nivo/index.js";

import { calculate_common_text_args } from "./calculate_common_text_args.js";

import text from "./employee_executive_level.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { ex_levels } = businessConstants;

const calculate_funcs_by_level = {
  gov: (orgEmployeeExLvl, gov) => {
    const gov_five_year_total_head_count = _(
      orgEmployeeExLvl.q().gov_grouping()
    )
      .map((row) => sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0);

    // assuming gov roll up has data in every ex (and non-ex) group... safe because if it didn't then those groups would be dropped?
    return {
      has_non_ex_only: false,
      series: _.chain(ex_levels)
        .values()
        .map((ex_level) => {
          const ex_level_name = ex_level.text;
          const yearly_values = people_years.map(
            (year) => orgEmployeeExLvl.horizontal(year, false)[ex_level_name]
          );

          return {
            label: ex_level_name,
            data: yearly_values,
            five_year_percent:
              yearly_values.reduce(function (sum, val) {
                return sum + val;
              }, 0) / gov_five_year_total_head_count,
            active: ex_level_name !== "Non-EX",
          };
        })
        .sortBy((d) => d.label)
        .value(),
    };
  },
  dept: (orgEmployeeExLvl, dept) => {
    const ex_level_data = orgEmployeeExLvl.q(dept).data;

    const has_non_ex_only = _(ex_level_data)
      .filter(({ ex_lvl }) => ex_lvl !== "Non-EX")
      .isEmpty();

    return {
      has_non_ex_only,
      series: _.chain(ex_level_data)
        .map((row) => ({
          label: row.ex_lvl,
          data: people_years.map((year) => row[year]),
          five_year_percent: row.five_year_percent,
          active: has_non_ex_only || row.ex_lvl !== "Non-EX",
        }))
        .filter((d) => sum(d.data) !== 0)
        .sortBy((d) => d.label)
        .value(),
    };
  },
};

export const declare_employee_executive_level_panel = () =>
  declare_panel({
    panel_key: "employee_executive_level",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeExLvl"],
      title: text_maker("employee_executive_level_title"),
      calculate: function (subject) {
        const { orgEmployeeExLvl } = this.tables;

        return calculate_funcs_by_level[level](orgEmployeeExLvl, subject);
      },
      render({ title, calculations, footnotes, sources }) {
        const {
          panel_args: { series, has_non_ex_only },
          subject,
        } = calculations;

        const text_calculations = (() => {
          if (has_non_ex_only) {
            return {
              ...calculate_common_text_args(series),
              subject,
              avg_num_non_ex: _.chain(series)
                .first(({ label }) => label === "Non-EX")
                .thru(({ data }) => _.mean(data))
                .value(),
            };
          } else {
            const ex_only_series = _.filter(
              series,
              ({ label }) => label !== "Non-EX"
            );

            const sum_exec = _.reduce(
              ex_only_series,
              (result, ex_lvl) => result + _.sum(ex_lvl.data),
              0
            );

            const common_text_args = calculate_common_text_args(
              ex_only_series,
              sum_exec
            );

            const {
              first_active_year_index,
              last_active_year_index,
            } = common_text_args;

            const avg_num_employees =
              _.reduce(
                series,
                (result, ex_lvl) => result + _.sum(ex_lvl.data),
                0
              ) /
              (last_active_year_index - first_active_year_index + 1);

            const avg_num_execs =
              sum_exec / (last_active_year_index - first_active_year_index + 1);
            const avg_pct_execs = avg_num_execs / avg_num_employees;

            return {
              ...common_text_args,
              subject,
              avg_num_execs,
              avg_pct_execs,
            };
          }
        })();

        const ticks = _.map(people_years, (y) => `${run_template(y)}`);

        return (
          <StdPanel {...{ title, footnotes, sources }}>
            <Col size={12} isText>
              <TM
                k={
                  has_non_ex_only
                    ? "all_non_executive_employee_text"
                    : `${level}_employee_executive_level_text`
                }
                args={text_calculations}
              />
            </Col>
            <Col size={12} isGraph>
              <NivoLineBarToggle
                {...{
                  legend_title: text_maker("ex_level"),
                  bar: true,
                  graph_options: {
                    y_axis: text_maker("employees"),
                    ticks: ticks,
                    formatter: formats.big_int_raw,
                  },
                  initial_graph_mode: "bar_stacked",
                  data: series,
                }}
              />
            </Col>
          </StdPanel>
        );
      },
    }),
  });
