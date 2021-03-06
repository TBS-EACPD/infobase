import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";

import { create_text_maker_component } from "src/components/index";

import { year_templates } from "src/models/years";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoCircleProportion } from "src/charts/wrapped_nivo/index";

import text2 from "src/common_text/common_lang.yaml";

import text1 from "./employee_last_year_totals.yaml";
const { people_years } = year_templates;

const { text_maker, TM } = create_text_maker_component([text1, text2]);

export const declare_employee_last_year_totals_panel = () =>
  declare_panel({
    panel_key: "employee_last_year_totals",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeType"],
      title: text_maker("dept_employee_last_year_totals_title"),
      calculate(subject) {
        const { orgEmployeeType } = this.tables;
        const dept_last_year_emp = orgEmployeeType
          .q(subject)
          .sum(people_years, { as_object: true })["{{ppl_last_year}}"];

        const gov_last_year_emp = orgEmployeeType
          .q()
          .sum(people_years, { as_object: true })["{{ppl_last_year}}"];

        return {
          vals: [
            {
              name: "gov_last_year_emp",
              value: gov_last_year_emp,
            },
            {
              name: "dept_last_year_emp",
              value: dept_last_year_emp,
            },
          ],
          center: true,
        };
      },

      render({ title, calculations, footnotes, sources }) {
        const { subject, panel_args } = calculations;

        const dept_emp_value = panel_args.vals[1].value;
        const gov_emp_value = panel_args.vals[0].value;

        const dept_emp_pct = dept_emp_value / gov_emp_value;

        const text_calculations = { dept_emp_value, dept_emp_pct, subject };
        return (
          <StdPanel {...{ title, footnotes, sources }} allowOverflow={true}>
            <Col size={!is_a11y_mode ? 5 : 12} isText>
              <TM
                k="dept_employee_last_year_totals_text"
                args={text_calculations}
              />
            </Col>
            {!is_a11y_mode && (
              <Col size={7} isGraph>
                <WrappedNivoCircleProportion
                  height={200}
                  is_money={false}
                  child_value={dept_emp_value}
                  child_name={text_maker("dept_headcount", { subject })}
                  parent_value={gov_emp_value}
                  parent_name={text_maker("all_fps")}
                />
              </Col>
            )}
          </StdPanel>
        );
      },
    }),
  });
