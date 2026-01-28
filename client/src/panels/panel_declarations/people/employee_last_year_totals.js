import React, { useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import {
  useOrgPeopleSummary,
  useGovPeopleSummary,
} from "src/models/people/queries";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { CircleProportionGraph } from "src/charts/wrapped_nivo/index";

import text2 from "src/common_text/common_lang.yaml";

import text1 from "./employee_last_year_totals.yaml";

const { text_maker, TM } = create_text_maker_component([text1, text2]);

const EmployeeLastYearTotalsPanel = ({
  title,
  subject,
  footnotes,
  sources,
}) => {
  const { data: orgData, loading: orgLoading } = useOrgPeopleSummary({
    org_id: subject.id,
  });

  const { data: govData, loading: govLoading } = useGovPeopleSummary({});

  const calculations = useMemo(() => {
    if (!orgData?.type || !govData?.type) return null;

    // Calculate department's last year employee count
    let dept_last_year_emp = 0;

    // Get the last year's data for each employee type and sum them
    orgData.type
      .filter((typeData) => typeData && typeData.yearly_data)
      .forEach((typeData) => {
        if (typeData.yearly_data && typeData.yearly_data.length > 0) {
          const lastYearData =
            typeData.yearly_data[typeData.yearly_data.length - 1];
          if (lastYearData && lastYearData.value !== null) {
            dept_last_year_emp += lastYearData.value;
          }
        }
      });

    // Calculate government's last year employee count
    let gov_last_year_emp = 0;

    // Get the last year's data for each employee type and sum them
    govData.type
      .filter((typeData) => typeData && typeData.yearly_data)
      .forEach((typeData) => {
        if (typeData.yearly_data && typeData.yearly_data.length > 0) {
          const lastYearData =
            typeData.yearly_data[typeData.yearly_data.length - 1];
          if (lastYearData && lastYearData.value !== null) {
            gov_last_year_emp += lastYearData.value;
          }
        }
      });

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
  }, [orgData, govData]);

  const loading = orgLoading || govLoading;

  if (
    !loading &&
    (!calculations ||
      calculations.vals[0].value === 0 ||
      calculations.vals[1].value === 0)
  ) {
    return null;
  }

  // Only calculate these values when we have data
  const dept_emp_value = calculations?.vals[1]?.value ?? 0;
  const gov_emp_value = calculations?.vals[0]?.value ?? 0;
  const dept_emp_pct = gov_emp_value > 0 ? dept_emp_value / gov_emp_value : 0;

  const text_calculations = { dept_emp_value, dept_emp_pct, subject };

  return (
    <StdPanel {...{ title, footnotes, sources }} allowOverflow={true}>
      {loading ? (
        <Col size={12}>
          <LeafSpinner config_name="subroute" />
        </Col>
      ) : (
        <>
          <Col size={!is_a11y_mode ? 5 : 12} isText>
            <TM
              k="dept_employee_last_year_totals_text"
              args={text_calculations}
            />
          </Col>
          {!is_a11y_mode && (
            <Col size={7} isGraph>
              <CircleProportionGraph
                height={200}
                is_money={false}
                child_value={dept_emp_value}
                child_name={text_maker("dept_headcount", { subject })}
                parent_value={gov_emp_value}
                parent_name={text_maker("all_fps")}
              />
            </Col>
          )}
        </>
      )}
    </StdPanel>
  );
};

export const declare_employee_last_year_totals_panel = () =>
  declare_panel({
    panel_key: "employee_last_year_totals",
    subject_types: ["dept"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["employee_type"],
      get_title: () => text_maker("dept_employee_last_year_totals_title"),
      calculate: ({ subject }) => {
        // For dept, check if people_data exists
        return subject.has_data("people_data");
      },
      render: (props) => <EmployeeLastYearTotalsPanel {...props} />,
    }),
  });
