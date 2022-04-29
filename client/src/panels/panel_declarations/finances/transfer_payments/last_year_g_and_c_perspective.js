import _ from "lodash";
import React, { Fragment } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { CircleProportionGraph } from "src/charts/wrapped_nivo/index";

import { text_maker, TM } from "./gnc_text_provider";

export const declare_last_year_g_and_c_perspective_panel = () =>
  declare_panel({
    panel_key: "last_year_g_and_c_perspective",
    subject_types: ["dept"],
    panel_config_func: () => ({
      legacy_table_dependencies: ["orgTransferPayments", "programSpending"],
      get_dataset_keys: () => ["transfer_payments", "program_spending"],
      footnotes: ["SOBJ10"],
      get_title: () => text_maker("last_year_g_and_c_perspective_title"),
      calculate: ({ subject, tables }) => {
        const { orgTransferPayments, programSpending } = tables;

        const exp_pa_last_year = "{{pa_last_year}}exp";

        const gov_tp = _.chain(
          orgTransferPayments.sum_cols_by_grouped_data(
            [exp_pa_last_year],
            "type_id"
          )
        )
          .map((payment_type) => _.sum(payment_type))
          .sum()
          .value();

        const org_tp = _.chain(
          orgTransferPayments.sum_cols_by_grouped_data(
            [exp_pa_last_year],
            "type_id",
            subject
          )
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
      render({ title, subject, calculations, footnotes, sources, datasets }) {
        const { gov_tp, org_tp, dept_spending } = calculations;

        return (
          <StdPanel
            {...{ title, footnotes, sources, datasets, allowOverflow: true }}
          >
            <Col size={!is_a11y_mode ? 6 : 12} isText>
              <TM
                k="dept_last_year_g_and_c_perspective_text"
                args={calculations}
              />
            </Col>
            {!is_a11y_mode && (
              <Fragment>
                <Col size={3} isGraph>
                  <CircleProportionGraph
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
                  <CircleProportionGraph
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
