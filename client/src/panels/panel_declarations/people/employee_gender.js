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

import text from "./employee_gender.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { gender } = businessConstants;

const calculate_funcs_by_level = {
  gov: function (gov) {
    const { orgEmployeeGender } = this.tables;

    const gov_five_year_total_head_count = _.chain(
      orgEmployeeGender.q().gov_grouping()
    )
      .map((row) => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.chain(gender)
      .values()
      .map((gender_type) => {
        const gender_text = gender_type.text;
        const yearly_values = people_years.map(
          (year) => orgEmployeeGender.horizontal(year, false)[gender_text]
        );
        return {
          label: gender_text,
          data: yearly_values,
          five_year_percent:
            yearly_values.reduce(function (sum, val) {
              return sum + val;
            }, 0) / gov_five_year_total_head_count,
          active: true,
        };
      })
      .sortBy((d) => -d3.sum(d.data))
      .value();
  },
  dept: function (dept) {
    const { orgEmployeeGender } = this.tables;
    return _.chain(orgEmployeeGender.q(dept).data)
      .map((row) => ({
        label: row.gender,
        data: people_years.map((year) => row[year]),
        five_year_percent: row.five_year_percent,
        active: true,
      }))
      .filter((d) => d3.sum(d.data) !== 0)
      .sortBy((d) => -d3.sum(d.data))
      .value();
  },
};

export const declare_employee_gender_panel = () =>
  declare_panel({
    panel_key: "employee_gender",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeGender"],
      calculate: calculate_funcs_by_level[level],

      render({ calculations, footnotes, sources }) {
        const { panel_args, subject } = calculations;

        const [women, men] = panel_args;
        const women_men_only = [women, men];

        const text_calculations = {
          ...text_calculate(women_men_only),
          subject,
        };

        const ticks = _.map(people_years, (y) => `${run_template(y)}`);

        let required_footnotes;
        const has_suppressed_data = _.some(
          panel_args,
          (graph_arg) => graph_arg.label === gender.sup.text
        );
        if (has_suppressed_data) {
          required_footnotes = footnotes;
        } else {
          required_footnotes = _.filter(
            footnotes,
            (footnote) =>
              !_.some(footnote.topic_keys, (key) => key === "SUPPRESSED_DATA")
          );
        }

        return (
          <StdPanel
            title={text_maker("employee_gender_title")}
            {...{ footnotes: required_footnotes, sources }}
          >
            <Col size={12} isText>
              <TM
                k={level + "_employee_gender_text"}
                args={text_calculations}
              />
            </Col>
            <Col size={12} isGraph>
              <NivoLineBarToggle
                {...{
                  legend_title: text_maker("employee_gender"),
                  bar: true,
                  graph_options: {
                    y_axis: text_maker("employees"),
                    ticks: ticks,
                    formatter: formats.big_int_raw,
                  },
                  initial_graph_mode: "bar_grouped",
                  data: panel_args,
                }}
              />
            </Col>
          </StdPanel>
        );
      },
    }),
  });
