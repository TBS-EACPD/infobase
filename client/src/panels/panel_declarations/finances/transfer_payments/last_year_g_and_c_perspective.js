import React, { Fragment, useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { LeafSpinner } from "src/components/index";

import { calculate_last_year_g_and_c_perspective_from_finance_data } from "src/models/finances/transfer_payments_calculations";
import { useTransferPaymentsFinanceData } from "src/models/finances/useTransferPaymentsFinanceData";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { CircleProportionGraph } from "src/charts/wrapped_nivo/index";

import { text_maker, TM } from "./gnc_text_provider";

const LastYearGAndCPerspectiveContainer = (props) => {
  const { subject, title, footnotes, sources, datasets } = props;
  const { loading, finance_data } = useTransferPaymentsFinanceData(subject, {
    with_gov: true,
  });

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_last_year_g_and_c_perspective_from_finance_data(
      subject,
      finance_data
    );
  }, [loading, subject, finance_data]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  const { gov_tp, org_tp, dept_spending } = calculations;

  return (
    <StdPanel
      {...{ title, footnotes, sources, datasets, allowOverflow: true }}
    >
      <Col size={!is_a11y_mode ? 6 : 12} isText>
        <TM k="dept_last_year_g_and_c_perspective_text" args={calculations} />
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
};

export const declare_last_year_g_and_c_perspective_panel = () =>
  declare_panel({
    panel_key: "last_year_g_and_c_perspective",
    subject_types: ["dept"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["transfer_payments", "program_spending"],
      get_title: () => text_maker("last_year_g_and_c_perspective_title"),
      calculate: () => true,
      render: (props) => <LastYearGAndCPerspectiveContainer {...props} />,
    }),
  });
