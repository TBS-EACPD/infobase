import { Fragment } from "react";

import {
  StdPanel,
  Col,
  CircleProportionChart,
  declare_panel,
} from "../../shared.js";

import { text_maker, TM } from "./gnc_text_provider.js";

export const declare_last_year_g_and_c_perspective_panel = () =>
  declare_panel({
    panel_key: "last_year_g_and_c_perspective",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgTransferPayments", "programSpending"],
      footnotes: ["SOBJ10"],
      calculate(subject, options) {
        const { orgTransferPayments, programSpending } = this.tables;

        const gov_tp = _.sum(
          _.map(
            orgTransferPayments.payment_type_ids(
              ["{{pa_last_year}}exp"],
              false
            ),
            (payment_type) => _.sum(payment_type)
          )
        );

        const org_tp = _.sum(
          _.map(
            orgTransferPayments.payment_type_ids(
              ["{{pa_last_year}}exp"],
              subject.id
            ),
            (payment_type) => _.sum(payment_type)
          )
        );

        const dept_spending = programSpending
          .q(subject)
          .sum("{{pa_last_year}}exp");

        const dept_pct = org_tp / dept_spending;
        const total_pct = org_tp / gov_tp;

        const text_calculations = {
          subject,
          gov_tp,
          org_tp,
          dept_spending,
          dept_pct,
          total_pct,
        };

        return { gov_tp, org_tp, dept_spending, text_calculations };
      },
      render({ calculations, footnotes, sources }) {
        const { subject, panel_args } = calculations;
        const { text_calculations } = panel_args;
        const gov_tp_exp_pa_last_year = panel_args.gov_tp;
        const dept_tp_exp_pa_last_year = panel_args.org_tp;
        const dept_exp_pa_last_year = panel_args.dept_spending;

        return (
          <StdPanel
            title={text_maker("last_year_g_and_c_perspective_title")}
            footnotes={footnotes}
            sources={sources}
            allowOverflow={true}
          >
            <Col size={!window.is_a11y_mode ? 6 : 12} isText>
              <TM
                k="dept_last_year_g_and_c_perspective_text"
                args={text_calculations}
              />
            </Col>
            {!window.is_a11y_mode && (
              <Fragment>
                <Col size={3} isGraph>
                  <CircleProportionChart
                    height={200}
                    child_value={dept_tp_exp_pa_last_year}
                    child_name={text_maker("dept_transfer_payments", {
                      subject,
                    })}
                    parent_value={dept_exp_pa_last_year}
                    parent_name={text_maker("dept_expenditures", { subject })}
                  />
                </Col>
                <Col size={3} isGraph>
                  <CircleProportionChart
                    height={200}
                    child_value={dept_tp_exp_pa_last_year}
                    child_name={text_maker("dept_transfer_payments", {
                      subject,
                    })}
                    parent_value={gov_tp_exp_pa_last_year}
                    parent_name={text_maker("gov_transfer_payments")}
                  />
                </Col>
              </Fragment>
            )}
          </StdPanel>
        );
      },
    }),
  });
