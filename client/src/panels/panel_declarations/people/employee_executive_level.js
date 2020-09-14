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

import text from "./employee_executive_level.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { ex_levels } = businessConstants;

const info_deps_by_level = {
  gov: ["orgEmployeeExLvl_gov_info"],
  dept: ["orgEmployeeExLvl_gov_info", "orgEmployeeExLvl_dept_info"],
};

const calculate_funcs_by_level = {
  gov: function (gov, info) {
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
  dept: function (dept, info) {
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
      info_deps: info_deps_by_level[level],
      calculate: calculate_funcs_by_level[level],

      render({ calculations, footnotes, sources }) {
        const { info, panel_args } = calculations;

        const ticks = _.map(people_years, (y) => `${run_template(y)}`);

        return (
          <StdPanel
            title={text_maker("employee_executive_level_title")}
            {...{ footnotes, sources }}
          >
            <Col size={12} isText>
              <TM k={level + "_employee_executive_level_text"} args={info} />
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
