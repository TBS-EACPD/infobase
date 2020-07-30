import {
  formats,
  run_template,
  businessConstants,
  year_templates,
  create_text_maker_component,
  StdPanel,
  Col,
  declare_panel,
  NivoLineBarToggle,
} from "../shared.js";
import { text_calculate } from "./text_calculator";

import text from "./employee_executive_level.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { ex_levels } = businessConstants;

const calculate_funcs_by_level = {
  gov: function (gov) {
    const { orgEmployeeExLvl } = this.tables;

    const gov_five_year_total_head_count = _.chain(
      orgEmployeeExLvl.q().gov_grouping()
    )
      .map((row) => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.chain(ex_levels)
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
      .value();
  },
  dept: function (dept) {
    const { orgEmployeeExLvl } = this.tables;
    return _.chain(orgEmployeeExLvl.q(dept).data)
      .map((row) => ({
        label: row.ex_lvl,
        data: people_years.map((year) => row[year]),
        five_year_percent: row.five_year_percent,
        active: row.ex_lvl !== "Non-EX",
      }))
      .filter((d) => d3.sum(d.data) !== 0)
      .sortBy((d) => d.label)
      .value();
  },
};

export const declare_employee_executive_level_panel = () =>
  declare_panel({
    panel_key: "employee_executive_level",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeExLvl"],
      calculate: calculate_funcs_by_level[level],

      render({ calculations, footnotes, sources }) {
        const { panel_args, subject } = calculations;

        const data_without_nonex = _.chain([...panel_args])
          .reverse()
          .tail()
          .reverse()
          .value();

        const sum_exec = _.reduce(
          data_without_nonex,
          (result, ex_lvl) => result + _.sum(ex_lvl.data),
          0
        );

        const pre_text_calculations = text_calculate(
          data_without_nonex,
          sum_exec
        );

        const {
          first_active_year_index,
          last_active_year_index,
        } = pre_text_calculations;

        const avg_num_execs =
          sum_exec / (last_active_year_index - first_active_year_index + 1);

        const avg_num_employees =
          _.reduce(
            panel_args,
            (result, ex_lvl) => result + _.sum(ex_lvl.data),
            0
          ) /
          (last_active_year_index - first_active_year_index + 1);
        const avg_pct_execs = avg_num_execs / avg_num_employees;

        const text_calculations = {
          ...pre_text_calculations,
          avg_num_execs,
          avg_pct_execs,
          subject,
        };

        const ticks = _.map(people_years, (y) => `${run_template(y)}`);

        return (
          <StdPanel
            title={text_maker("employee_executive_level_title")}
            {...{ footnotes, sources }}
          >
            <Col size={12} isText>
              <TM
                k={level + "_employee_executive_level_text"}
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
                  data: panel_args,
                }}
              />
            </Col>
          </StdPanel>
        );
      },
    }),
  });
