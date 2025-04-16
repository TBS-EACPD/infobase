import { scaleOrdinal } from "d3-scale";
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
  useOrgPeopleSummary,
  useGovPeopleSummary,
} from "src/models/people/queries";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { newIBCategoryColors } from "src/core/color_schemes";
import { formats } from "src/core/format";

import { lang } from "src/core/injected_build_constants";

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
    if (!data || !data.age_group) {
      return null;
    }

    // Process age_group data
    const age_group = data.age_group
      .filter((group) => group && group.yearly_data)
      .map((row) => {
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
      .filter((group) => _.some(group.data, (d) => d !== 0))
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true })
      );

    // Process average_age data
    const avg_age = [];

    // Add department data if available
    if (data.average_age && data.average_age.length > 0) {
      avg_age.push({
        label: subject.name,
        data: data.average_age
          .filter((entry) => entry)
          .map((entry) => {
            if (entry.value === -1) {
              return 5;
            } else if (entry.value === null || entry.value === undefined) {
              return 0;
            } else {
              return entry.value;
            }
          }),
        active: true,
      });
    }

    // Add FPS data if we're looking at a department and have gov data
    if (
      subject_type === "dept" &&
      govData &&
      govData.average_age &&
      govData.average_age.length > 0
    ) {
      avg_age.push({
        label: text_maker("fps"),
        data: govData.average_age
          .filter((entry) => entry)
          .map((entry) => {
            if (entry.value === -1) {
              return 5;
            } else if (entry.value === null || entry.value === undefined) {
              return 0;
            } else {
              return entry.value;
            }
          }),
        active: true,
      });
    }

    return {
      avg_age,
      age_group,
    };
  }, [data, govData, subject.name, subject_type]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (
    !calculations ||
    !calculations.age_group ||
    calculations.age_group.length === 0
  ) {
    return null;
  }

  const { avg_age, age_group } = calculations;

  // Fix for gov_avgage values when viewing at government level
  const dept_avg_first_active_year =
    avg_age.length > 0 ? _.first(avg_age[0].data) : null;
  const dept_avg_last_active_year =
    avg_age.length > 0 ? _.last(avg_age[0].data) : null;

  // When subject_type is 'gov', avg_age[0] contains the government data
  // When subject_type is 'dept', avg_age[1] contains the government data (if available)
  const gov_avgage_last_year_5 =
    subject_type === "gov"
      ? _.first(avg_age[0].data)
      : avg_age.length > 1
      ? _.first(avg_age[1].data)
      : null;

  const gov_avgage_last_year =
    subject_type === "gov"
      ? _.last(avg_age[0].data)
      : avg_age.length > 1
      ? _.last(avg_age[1].data)
      : null;

  const common_text_args = calculate_common_text_args(age_group);

  const text_calculations = {
    ...common_text_args,
    ..._.chain(["top", "bottom"])
      .map((key_prefix) => {
        const key = `${key_prefix}_avg_group`;
        return [
          key,
          lang === "en"
            ? common_text_args[key]?.replace("Age ", "")
            : common_text_args[key],
        ];
      })
      .fromPairs()
      .value(),
    dept_avg_first_active_year,
    dept_avg_last_active_year,
    gov_avgage_last_year_5,
    gov_avgage_last_year,
    subject,
  };

  const ticks = _.map(people_years, (y) => `${run_template(y)}`);

  // Single, consistent check for suppressed data
  const hasSuppressedData = _.some(
    calculations.age_group,
    (ageGroup) => ageGroup.suppressedFlags && _.some(ageGroup.suppressedFlags)
  );

  const required_footnotes = hasSuppressedData
    ? footnotes
    : _.filter(
        footnotes,
        (footnote) =>
          !_.some(footnote.topic_keys, (key) => key === "SUPPRESSED_DATA")
      );

  // Options for NivoLineBarToggle component
  const age_group_options = {
    legend_title: text_maker("age_group"),
    bar: true,
    get_colors: () => scaleOrdinal().range(newIBCategoryColors),
    graph_options: {
      ticks: ticks,
      y_axis: text_maker("employees"),
      responsive: true,
      animate: window.matchMedia("(prefers-reduced-motion: no-preference)")
        .matches,
      role: "img",
      ariaLabel: `${text_maker("age_group")} ${subject.name}`,
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
    },
    initial_graph_mode: "bar_grouped",
    data: calculations.age_group,
    formatter: (value) => {
      // Check if this is a suppressed data point
      if (value === 5) {
        return "*";
      }
      return formats.big_int_raw(value);
    },
  };

  const avg_age_options = {
    legend_title: text_maker("legend"),
    bar: false,
    graph_options: {
      ticks: ticks,
      y_axis: text_maker("avgage"),
      formatter: formats.int,
      responsive: true,
      animate: false,
      role: "img",
      ariaLabel: `${text_maker("avgage")} ${subject.name}`,
    },
    disable_toggle: true,
    initial_graph_mode: "line",
    data: calculations.avg_age,
    formatter: formats.decimal2,
  };

  return (
    <StdPanel {...{ title, footnotes: required_footnotes, sources, datasets }}>
      <Col size={12} isText>
        <TM k={subject_type + "_employee_age_text"} args={text_calculations} />
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
                    {hasSuppressedData && (
                      <div className="graph-note text-center mt-2 font-italic">
                        <small>
                          <span
                            className="mr-2"
                            style={{
                              display: "inline-block",
                              width: "20px",
                              height: "10px",
                              backgroundImage:
                                "linear-gradient(135deg, #999 25%, #D3D3D3 25%, #D3D3D3 50%, #999 50%, #999 75%, #D3D3D3 75%)",
                              backgroundSize: "8px 8px",
                            }}
                          ></span>
                          {text_maker("suppressed_data_pattern_note")}
                        </small>
                      </div>
                    )}
                  </GraphOverlay>
                  <div className="clearfix"></div>
                </div>
              ),
            },
            avgage: {
              label: text_maker("avgage"),
              content: (
                <div id={"emp_age_tab_pane"}>
                  <NivoLineBarToggle {...avg_age_options} />
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
      get_dataset_keys: () => ["age_group", "avg_age"],
      get_title: () => text_maker("employee_age_title"),
      render(props) {
        return <EmployeeAgePanel {...props} subject_type={subject_type} />;
      },
    }),
  });
