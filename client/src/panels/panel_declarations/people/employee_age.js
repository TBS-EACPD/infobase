import _ from "lodash";
import React, { useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  TabsStateful,
  GraphOverlay,
  LeafSpinner,
} from "src/components/index";

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

import text from "./employee_age.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;

const EmployeeAgePanel = ({
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
    if (!data) return { age_group: [], avg_age: [] };

    const age_group =
      data.age?.map((row) => {
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
      }) || [];

    const avg_age =
      data.avgAge?.map((row) => {
        const is_dept = row.dimension === "dept";
        return {
          label: is_dept ? subject.name : "Overall FPS",
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
          active: true,
        };
      }) || [];

    return {
      age_group: age_group.filter((item) =>
        _.some(item.data, (val) => val !== 0)
      ),
      avg_age: avg_age.filter((item) => _.some(item.data, (val) => val !== 0)),
    };
  }, [data, subject]);

  // Check for suppressed data in age groups and average age separately
  const {
    hasSuppressedData: hasSuppressedAgeGroupData,
    isHeavilySuppressed: isAgeGroupHeavilySuppressed,
  } = useSuppressedDataDetection(calculations.age_group || []);

  const {
    hasSuppressedData: hasAvgAgeSuppressedData,
    isHeavilySuppressed: isAvgAgeHeavilySuppressed,
  } = useSuppressedDataDetection(calculations.avg_age || []);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (
    (!calculations.age_group || calculations.age_group.length === 0) &&
    (!calculations.avg_age || calculations.avg_age.length === 0)
  ) {
    return null;
  }

  const text_groups = (() => {
    if (!calculations.age_group || calculations.age_group.length === 0) {
      return [];
    }

    const sorted_groups = _.sortBy(calculations.age_group, "five_year_percent");
    return _.uniq([_.last(sorted_groups)]);
  })();

  const text_calculations = {
    ...calculate_common_text_args(text_groups),
    subject,
    // Additional avg age values
    gov_avgage_last_year: _.chain(calculations.avg_age)
      .filter((row) => row.label === "Overall FPS")
      .map((row) => _.last(row.data))
      .first()
      .value(),
    gov_avgage_last_year_5: _.chain(calculations.avg_age)
      .filter((row) => row.label === "Overall FPS")
      .map((row) => _.first(row.data))
      .first()
      .value(),
    dept_avg_first_active_year: _.chain(calculations.avg_age)
      .filter((row) => row.label === subject.name)
      .map((row) => _.first(row.data))
      .first()
      .value(),
    dept_avg_last_active_year: _.chain(calculations.avg_age)
      .filter((row) => row.label === subject.name)
      .map((row) => _.last(row.data))
      .first()
      .value(),
  };

  const ticks = _.map(people_years, (y) => `${run_template(y)}`);

  // Consider data heavily suppressed if either age_group or avg_age is heavily suppressed
  const isHeavilySuppressed =
    isAgeGroupHeavilySuppressed || isAvgAgeHeavilySuppressed;
  const hasSuppressedData =
    hasSuppressedAgeGroupData || hasAvgAgeSuppressedData;

  // Determine which text template to use based on suppression levels
  const textKey = isHeavilySuppressed
    ? `${subject_type}_employee_age_text_temporary_no_avg_age`
    : `${subject_type}_employee_age_text`;

  const required_footnotes = hasSuppressedData
    ? footnotes
    : _.filter(
        footnotes,
        (footnote) =>
          !_.some(footnote.topic_keys, (key) => key === "SUPPRESSED_DATA")
      );

  // Configuration for the age group chart
  const age_group_options = {
    legend_title: text_maker("age_group"),
    bar: true,
    graph_options: {
      y_axis: text_maker("employees"),
      ticks: ticks,
      formatter: formats.big_int_raw,
      responsive: true,
      animate: window.matchMedia("(prefers-reduced-motion: no-preference)")
        .matches,
      role: "img",
      ariaLabel: `${text_maker("age_group")} ${subject.name}`,
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
    },
    disable_toggle: hasSuppressedAgeGroupData,
    tooltip_formatter: (value) => {
      if (value === 5) {
        return "*";
      }
      return formats.big_int_raw(value);
    },
    initial_graph_mode: "bar_grouped",
    data: calculations.age_group,
  };

  // Configuration for the average age chart
  const avg_age_options = {
    legend_title: text_maker("avgage"),
    // Use line mode for average age
    bar: false,
    graph_options: {
      y_axis: text_maker("avgage"),
      ticks: ticks,
      formatter: formats.decimal1,
      responsive: true,
      animate: window.matchMedia("(prefers-reduced-motion: no-preference)")
        .matches,
      role: "img",
      ariaLabel: `${text_maker("avgage")} ${subject.name}`,
      defs: [
        {
          id: "pattern-suppressed-data",
          type: "patternLines",
          background: "#D3D3D3",
          color: "#999999",
          lineWidth: 3,
          spacing: 8,
          rotation: -45,
        },
      ],
    },
    disable_toggle: hasAvgAgeSuppressedData,
    tooltip_formatter: (value) => {
      if (value === 5) {
        return "*";
      }
      return formats.decimal1(value);
    },
    initial_graph_mode: "line",
    data: calculations.avg_age,
  };

  return (
    <StdPanel {...{ title, footnotes: required_footnotes, sources }}>
      <Col size={12} isText>
        {isHeavilySuppressed ? (
          <div className="mb-3">
            <TM k="suppressed_data_warning" />
          </div>
        ) : (
          <TM k={textKey} args={text_calculations} />
        )}
      </Col>
      <Col size={12} isGraph>
        <TabsStateful
          tabs={{
            age_group: {
              label: text_maker("age_group"),
              content: (
                <div id={"emp_age_tab_pane"}>
                  <GraphOverlay>
                    <NivoLineBarToggle {...age_group_options} />
                    {hasSuppressedAgeGroupData && <SuppressedDataPattern />}
                  </GraphOverlay>
                  <div className="clearfix"></div>
                </div>
              ),
            },
            avgage: {
              label: text_maker("avgage"),
              content: (
                <div id={"emp_age_tab_pane"}>
                  <GraphOverlay>
                    <NivoLineBarToggle {...avg_age_options} />
                    {hasAvgAgeSuppressedData && <SuppressedDataPattern />}
                  </GraphOverlay>
                  <div className="clearfix"></div>
                </div>
              ),
            },
          }}
        />
      </Col>
    </StdPanel>
  );
};

export const declare_employee_age_panel = () =>
  declare_panel({
    panel_key: "employee_age",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => ({
      get_dataset_keys: () => ["employee_age"],
      get_title: () => text_maker("employee_age_title"),
      render(props) {
        return <EmployeeAgePanel {...props} subject_type={subject_type} />;
      },
    }),
  });
