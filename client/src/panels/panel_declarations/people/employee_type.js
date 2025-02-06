import _ from "lodash";
import React, { useMemo, memo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { useOrgPeopleSummary } from "src/models/people/queries";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { formats } from "src/core/format";

import { NivoLineBarToggle } from "src/charts/wrapped_nivo/index";

import { calculate_common_text_args } from "./calculate_common_text_args";

import text from "./employee_type.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;

const calculate_funcs_by_subject_type = (data) => {
  if (!data?.type) return [];

  const orgEmployeeType = data.type;
  return orgEmployeeType
    .map((row) => {
      const yearlyData = row.yearly_data.slice(-5);
      return {
        label: row.dimension,
        data: yearlyData.map((entry) => entry.value),
        five_year_percent: row.avg_share,
        active: true,
        total_employees: _.sumBy(yearlyData, "value"),
        year_range: `${yearlyData[0].year}-${
          yearlyData[yearlyData.length - 1].year
        }`,
      };
    })
    .sort((a, b) => b.total_employees - a.total_employees);
};

const EmployeeTypePanel = ({
  title,
  subject,
  //calculations,
  footnotes,
  sources,
  datasets,
  glossary_keys,
  subject_type,
}) => {
  const { data, loading } = useOrgPeopleSummary({
    org_id: subject.id,
  });

  const calculations = useMemo(
    () => calculate_funcs_by_subject_type(data),
    [data]
  );

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations || calculations.length === 0) {
    return null;
  }

  const common_text_args = calculate_common_text_args(calculations);

  const text_calculations = {
    ...common_text_args,
    subject,
  };

  const ticks = _.map(people_years, (y) => `${run_template(y)}`);

  const MemoizedNivoLineBarToggle = memo(NivoLineBarToggle);

  return (
    <StdPanel {...{ title, footnotes, sources, datasets, glossary_keys }}>
      <Col size={12} isText>
        <TM k={subject_type + "_employee_type_text"} args={text_calculations} />
      </Col>
      <Col size={12} isGraph>
        <MemoizedNivoLineBarToggle
          legend_title={text_maker("employee_type")}
          bar={true}
          graph_options={{
            ticks,
            y_axis: text_maker("employees"),
            formatter: formats.big_int_raw,
            responsive: true,
            animate: window.matchMedia(
              "(prefers-reduced-motion: no-preference)"
            ).matches,
            role: "img",
            ariaLabel: `${text_maker("employee_type")} ${subject.name}`,
          }}
          initial_graph_mode="bar_stacked"
          data={calculations}
        />
      </Col>
    </StdPanel>
  );
};

export const declare_employee_type_panel = () =>
  declare_panel({
    panel_key: "employee_type",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => ({
      legacy_table_dependencies: ["orgEmployeeType"],
      get_dataset_keys: () => ["employee_type"],
      get_title: () => text_maker("employee_type_title"),
      glossary_keys: [
        "INDET_PEOPLE",
        "TERM_PEOPLE",
        "CASUAL_PEOPLE",
        "STUD_PEOPLE",
      ],
      //calculate: calculate_funcs_by_subject_type[subject_type],

      render(props) {
        return <EmployeeTypePanel {...props} subject_type={subject_type} />;
      },
    }),
  });
