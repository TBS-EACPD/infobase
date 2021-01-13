import _ from "lodash";
import React, { Fragment } from "react";

import { is_a11y_mode } from "src/app_bootstrap/globals.js";

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

        const exp_pa_last_year = "{{pa_last_year}}exp";

        const gov_tp = _.chain(
          orgTransferPayments.payment_type_ids([exp_pa_last_year], false)
        )
          .map((payment_type) => _.sum(payment_type))
          .sum()
          .value();

        const org_tp = _.chain(
          orgTransferPayments.payment_type_ids([exp_pa_last_year], subject.id)
        )
          .map((payment_type) => _.sum(payment_type))
          .sum()
          .value();

        const dept_spending = programSpending.q(subject).sum(exp_pa_last_year);

        const dept_pct = org_tp / dept_spending;
        const total_pct = org_tp / gov_tp;

        return {
          subject,
          gov_tp,
          org_tp,
          dept_spending,
          dept_pct,
          total_pct,
        };
      },
      render({ calculations, footnotes, sources }) {
        const { subject, panel_args } = calculations;
        const { gov_tp, org_tp, dept_spending } = panel_args;

        return (
          <StdPanel
            title={text_maker("last_year_g_and_c_perspective_title")}
            footnotes={footnotes}
            sources={sources}
            allowOverflow={true}
          >
            <Col size={!is_a11y_mode ? 6 : 12} isText>
              <TM
                k="dept_last_year_g_and_c_perspective_text"
                args={panel_args}
              />
            </Col>
            {!is_a11y_mode && (
              <Fragment>
                <Col size={3} isGraph>
                  <CircleProportionChart
                    height={200}
                    child_value={org_tp}
                    child_name={text_maker("dept_transfer_payments", {
                      subject,
                    })}
                    parent_value={dept_spending}
                    parent_name={text_maker("dept_expenditures", { subject })}
                  />
                </Col>
                <Col size={3} isGraph>
                  <CircleProportionChart
                    height={200}
                    child_value={org_tp}
                    child_name={text_maker("dept_transfer_payments", {
                      subject,
                    })}
                    parent_value={gov_tp}
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
