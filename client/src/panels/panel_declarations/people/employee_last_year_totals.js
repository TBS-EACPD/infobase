import text2 from "../../../common_text/common_lang.yaml";
import {
  create_text_maker_component,
  StdPanel,
  Col,
  CircleProportionChart,
  declare_panel,
} from "../shared.js";

import text1 from "./employee_last_year_totals.yaml";

const { text_maker, TM } = create_text_maker_component([text1, text2]);

export const declare_employee_last_year_totals_panel = () =>
  declare_panel({
    panel_key: "employee_last_year_totals",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeType"],

      calculate(subject) {
        const { orgEmployeeType } = this.tables;
        const dept_last_year_emp = _.chain(orgEmployeeType.q(subject).data)
          .map((emp_type) => emp_type["{{ppl_last_year}}"])
          .sum()
          .value();
        const gov_last_year_emp = _.chain(orgEmployeeType.q().data)
          .map((dept) => dept["{{ppl_last_year}}"])
          .sum()
          .value();

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

      render({ calculations, footnotes, sources }) {
        const { subject, panel_args } = calculations;

        const dept_emp_value = panel_args.vals[1].value;
        const gov_emp_value = panel_args.vals[0].value;

        const dept_emp_pct = dept_emp_value / gov_emp_value;

        const text_calculations = { dept_emp_value, dept_emp_pct, subject };
        return (
          <StdPanel
            title={text_maker("dept_employee_last_year_totals_title")}
            {...{ footnotes, sources }}
            allowOverflow={true}
          >
            <Col size={!window.is_a11y_mode ? 5 : 12} isText>
              <TM
                k="dept_employee_last_year_totals_text"
                args={text_calculations}
              />
            </Col>
            {!window.is_a11y_mode && (
              <Col size={7} isGraph>
                <CircleProportionChart
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
