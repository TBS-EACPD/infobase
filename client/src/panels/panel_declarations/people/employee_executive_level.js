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

import { text_calculate } from "./text_calculator.js";

import text from "./employee_executive_level.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { ex_levels } = businessConstants;

const calculate_funcs_by_level = {
  gov: (gov, orgEmployeeExLvl) => {
    const gov_five_year_total_head_count = _.chain(
      orgEmployeeExLvl.q().gov_grouping()
    )
      .map((row) => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return {
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
  dept: function (dept) {
    const { orgEmployeeExLvl } = this.tables;
    const ex_level_data = orgEmployeeExLvl.q(dept).data;
    return {
      series: _.chain(ex_level_data)
        .map((row) => ({
          label: row.ex_lvl,
          data: people_years.map((year) => row[year]),
          five_year_percent: row.five_year_percent,
          active: row.ex_lvl !== "Non-EX" || ex_level_data.length < 2,
        }))
        .filter((d) => d3.sum(d.data) !== 0)
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
      calculate: function (subject) {
        const { orgEmployeeExLvl } = this.tables;

        const panel_args = calculate_funcs_by_level[level](
          subject,
          orgEmployeeExLvl
        );

        const has_non_ex_only = _.chain(panel_args.series)
          .filter(({ label }) => label !== "Non-EX")
          .isEmpty()
          .value();

        if (has_non_ex_only) {
          return false;
        } else {
          return panel_args;
        }
      },
      render({ calculations, footnotes, sources }) {
        const {
          panel_args: { series },
          subject,
        } = calculations;

        const data_without_nonex = _.initial(series);
        const ex_data_is_empty = _.isEmpty(data_without_nonex);

        const text_calculations = (() => {
          if (ex_data_is_empty) {
            console.log(series);
            const pre_text_calculations = text_calculate(series);
            return {
              ...pre_text_calculations,
              subject,
              avg_num_non_ex: _.mean(series[0].data),
            };
          } else {
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
                series,
                (result, ex_lvl) => result + _.sum(ex_lvl.data),
                0
              ) /
              (last_active_year_index - first_active_year_index + 1);
            const avg_pct_execs = avg_num_execs / avg_num_employees;
            return {
              ...pre_text_calculations,
              avg_num_execs,
              avg_pct_execs,
              subject,
            };
          }
        })();

        const ticks = _.map(people_years, (y) => `${run_template(y)}`);

        return (
          <StdPanel
            title={text_maker("employee_executive_level_title")}
            {...{ footnotes, sources }}
          >
            <Col size={12} isText>
              <TM
                k={
                  ex_data_is_empty
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
