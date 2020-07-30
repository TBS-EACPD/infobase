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

import text from "./employee_fol.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { fol } = businessConstants;

const calculate_funcs_by_level = {
  gov: function (gov) {
    const { orgEmployeeFol } = this.tables;

    const gov_five_year_total_head_count = _.chain(
      orgEmployeeFol.q().gov_grouping()
    )
      .map((row) => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.chain(fol)
      .values()
      .map((fol_type) => {
        const fol_text = fol_type.text;
        const yearly_values = people_years.map(
          (year) => orgEmployeeFol.horizontal(year, false)[fol_text]
        );
        return {
          label: fol_text,
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
    const { orgEmployeeFol } = this.tables;
    return _.chain(orgEmployeeFol.q(dept).data)
      .map((row) => ({
        label: row.fol,
        data: people_years.map((year) => row[year]),
        five_year_percent: row.five_year_percent,
        active: true,
      }))
      .filter((d) => d3.sum(d.data) !== 0)
      .sortBy((d) => -d3.sum(d.data))
      .value();
  },
};

export const declare_employee_fol_panel = () =>
  declare_panel({
    panel_key: "employee_fol",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeFol"],
      calculate: calculate_funcs_by_level[level],

      render({ calculations, footnotes, sources }) {
        const { panel_args, subject } = calculations;

        const [eng, fr] = panel_args;
        const eng_fr_only = [eng, fr];

        const text_calculations = { ...text_calculate(eng_fr_only), subject };

        const ticks = _.map(people_years, (y) => `${run_template(y)}`);

        let required_footnotes;
        const has_suppressed_data = _.some(
          panel_args,
          (graph_arg) => graph_arg.label === fol.sup.text
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
            title={text_maker("employee_fol_title")}
            {...{ footnotes: required_footnotes, sources }}
          >
            <Col size={12} isText>
              <TM k={level + "_employee_fol_text"} args={text_calculations} />
            </Col>
            <Col size={12} isGraph>
              <NivoLineBarToggle
                {...{
                  legend_title: text_maker("FOL"),
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
