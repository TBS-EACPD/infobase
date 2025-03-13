import _ from "lodash";
import React, { useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { businessConstants } from "src/models/businessConstants";
import { useOrgPeopleSummary, useGovPeopleSummary } from "src/models/people/queries";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { formats } from "src/core/format";

import { WrappedNivoLine } from "src/charts/wrapped_nivo/index";
import {
  primaryColor,
  textColor,
  backgroundColor,
} from "src/style_constants/index";

import text from "./employee_totals.yaml";

const { months } = businessConstants;

const { text_maker, TM } = create_text_maker_component(text);

const { people_years, people_years_short_second } = year_templates;

const EmployeeTotalsPanel = ({
  title,
  subject,
  footnotes,
  sources,
  datasets,
  subject_type,
}) => {
  const { data: orgData, loading: orgLoading } = useOrgPeopleSummary({
    org_id: subject.id,
  });
  
  const { data: govData, loading: govLoading } = useGovPeopleSummary({});
  
  // Select the appropriate data based on subject_type
  const data = subject_type === "gov" ? govData : orgData;
  const loading = subject_type === "gov" ? govLoading : orgLoading;

  const calculations = useMemo(() => {
    if (!data) return null;

    // Sum all employee types for each year to get total employees
    const series = [];
    
    // If we have type data, use it to calculate totals
    if (data.type && data.type.length > 0) {
      // Initialize array with zeros
      const yearCount = data.type[0].yearly_data.length;
      for (let i = 0; i < yearCount; i++) {
        series[i] = 0;
      }
      
      // Sum all employee types for each year
      data.type.forEach(typeData => {
        if (typeData.yearly_data) {
          typeData.yearly_data.forEach((yearData, index) => {
            if (yearData && yearData.value !== null) {
              series[index] += yearData.value;
            }
          });
        }
      });
    }
    
    return {
      series,
      ticks: _.map(people_years_short_second, (y) => `${run_template(y)}`),
    };
  }, [data]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations || !calculations.series || calculations.series.length === 0) {
    return null;
  }

  const { series, ticks } = calculations;

  const first_active_year_index = _.findIndex(series, (pop) => pop !== 0);
  const last_active_year_index = _.findLastIndex(
    series,
    (pop) => pop !== 0
  );
  const first_active_year = run_template(
    `${people_years[first_active_year_index]}`
  );
  const last_active_year = run_template(
    `${people_years[last_active_year_index]}`
  );
  const avg_num_emp =
    _.sum(series) /
    (last_active_year_index - first_active_year_index + 1);
  const last_year_num_emp = series[last_active_year_index];

  const text_calculations = {
    first_active_year,
    last_active_year,
    avg_num_emp,
    subject,
    last_year_num_emp,
  };

  const data_formatter = () => [
    {
      id: months[3].text,
      data: _.map(series, (data, index) => ({
        x: ticks[index],
        y: data,
      })),
    },
  ];

  return (
    <StdPanel {...{ title, footnotes, sources, datasets }}>
      <Col size={4} isText>
        <TM
          k={subject_type + "_employee_totals_text"}
          args={text_calculations}
        />
      </Col>
      <Col size={8} isGraph>
        <WrappedNivoLine
          data={data_formatter()}
          raw_data={series}
          colors={primaryColor}
          is_money={false}
          yScale={{ toggle: true }}
          tooltip={({ slice }) => (
            <div
              style={{
                padding: "5px",
                borderRadius: "10px",
                backgroundColor: backgroundColor,
                color: textColor,
                boxShadow: "rgb(0 0 0 / 25%) 0px 1px 2px",
              }}
            >
              <table
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  {slice.points.map((tooltip_item) => (
                    <tr key={tooltip_item.serieId}>
                      <td className="nivo-tooltip__icon">
                        <div
                          style={{
                            height: "12px",
                            width: "12px",
                            backgroundColor: tooltip_item.serieColor,
                          }}
                        />
                      </td>
                      <td className="nivo-tooltip__label">
                        {tooltip_item.serieId}
                      </td>
                      <td className="nivo-tooltip__label">
                        {tooltip_item.data.x}
                      </td>
                      <td
                        className="nivo-tooltip__value"
                        dangerouslySetInnerHTML={{
                          __html: formats.big_int(tooltip_item.data.y),
                        }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        />
      </Col>
    </StdPanel>
  );
};

export const declare_employee_totals_panel = () =>
  declare_panel({
    panel_key: "employee_totals",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => ({
      get_dataset_keys: () => ["employee_type"],
      get_title: () => text_maker(subject_type + "_employee_totals_title"),
      render(props) {
        return <EmployeeTotalsPanel {...props} subject_type={subject_type} />;
      },
    }),
  });
