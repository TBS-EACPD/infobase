import _ from "lodash";
import React, { useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { businessConstants } from "src/models/businessConstants";
import {
  useSuppressedDataDetection,
  SuppressedDataPattern,
} from "src/models/people/hooks";
import {
  useOrgPeopleSummary,
  useGovPeopleSummary,
} from "src/models/people/queries";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { formats } from "src/core/format";

import { NivoLineBarToggle } from "src/charts/wrapped_nivo/index";

import { calculate_common_text_args } from "./calculate_common_text_args";

import text from "./employee_gender.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { gender } = businessConstants;

const EmployeeGenderPanel = ({
  title,
  subject,
  footnotes,
  sources,
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
    if (!data?.gender) return [];

    return data.gender
      .filter((item) => item && item.yearly_data)
      .map((row) => {
        // Create suppressed flags array to track which values are suppressed
        const suppressedFlags = row.yearly_data
          .filter((entry) => entry)
          .map((entry) => entry.value === -1);

        return {
          label: row.dimension,
          // Store original values for display in tables/tooltips
          displayData: row.yearly_data
            .filter((entry) => entry)
            .map((entry) => (entry.value === -1 ? "*" : entry.value)),
          // Store numeric values for chart rendering
          data: row.yearly_data
            .filter((entry) => entry)
            .map((entry) => {
              if (entry.value === -1) {
                return 5; // Numeric value for suppressed data
              } else if (entry.value === null || entry.value === undefined) {
                return 0;
              } else {
                return entry.value;
              }
            }),
          // Track which values are suppressed for styling
          suppressedFlags,
          five_year_percent: row.avg_share,
          active: true,
        };
      })
      .filter((item) => _.some(item.data, (val) => val !== 0))
      .sort((a, b) => _.sum(b.data) - _.sum(a.data));
  }, [data]);

  // Move hook call here, before any conditional returns
  const { hasSuppressedData, isHeavilySuppressed } = useSuppressedDataDetection(
    calculations || [] // Pass empty array if calculations is null
  );

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations || calculations.length === 0) {
    return null;
  }

  const text_groups = (() => {
    const has_male_data = _.some(
      calculations,
      ({ label }) => label === gender.male.text
    );
    const has_female_data = _.some(
      calculations,
      ({ label }) => label === gender.female.text
    );
    const has_male_female_data = has_male_data && has_female_data;

    if (has_male_female_data) {
      return _.filter(
        calculations,
        ({ label }) =>
          label === gender.male.text || label === gender.female.text
      );
    } else {
      const sorted_groups = _.sortBy(calculations, "five_year_percent");
      return _.uniq([_.head(sorted_groups), _.last(sorted_groups)]);
    }
  })();

  const text_calculations = {
    ...calculate_common_text_args(text_groups),
    single_type_flag: text_groups.length === 1,
    subject,
  };

  const ticks = _.map(people_years, (y) => `${run_template(y)}`);

  const required_footnotes = hasSuppressedData
    ? footnotes
    : _.filter(
        footnotes,
        (footnote) =>
          !_.some(footnote.topic_keys, (key) => key === "SUPPRESSED_DATA")
      );

  return (
    <StdPanel {...{ title, footnotes: required_footnotes, sources }}>
      <Col size={12} isText>
        {isHeavilySuppressed ? (
          <div className="mb-3">
            <TM k="suppressed_data_warning" />
          </div>
        ) : (
          <TM
            k={subject_type + "_employee_gender_text"}
            args={text_calculations}
          />
        )}
      </Col>
      <Col size={12} isGraph>
        <NivoLineBarToggle
          legend_title={text_maker("employee_gender")}
          bar={true}
          graph_options={{
            y_axis: text_maker("employees"),
            ticks: ticks,
            formatter: formats.big_int_raw,
            responsive: true,
            animate: window.matchMedia(
              "(prefers-reduced-motion: no-preference)"
            ).matches,
            role: "img",
            ariaLabel: `${text_maker("employee_gender")} ${subject.name}`,
            // Define patterns for suppressed data
            defs: [
              {
                id: "pattern-suppressed-data",
                type: "patternLines",
                background: "#D3D3D3", // Light grey background
                color: "#999999", // Darker grey lines
                lineWidth: 3,
                spacing: 8,
                rotation: -45,
              },
            ],
          }}
          // Disable toggle if there's suppressed data, since we only want to use bar charts
          disable_toggle={hasSuppressedData}
          tooltip_formatter={(value) => {
            // Check if this is a suppressed data point
            if (value === 5) {
              return "*";
            }
            return formats.big_int_raw(value);
          }}
          initial_graph_mode="bar_grouped"
          data={calculations}
        />
        {hasSuppressedData && <SuppressedDataPattern />}
      </Col>
    </StdPanel>
  );
};

export const declare_employee_gender_panel = () =>
  declare_panel({
    panel_key: "employee_gender",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => ({
      get_dataset_keys: () => ["employee_gender"],
      get_title: () => text_maker("employee_gender_title"),
      render(props) {
        return <EmployeeGenderPanel {...props} subject_type={subject_type} />;
      },
    }),
  });
