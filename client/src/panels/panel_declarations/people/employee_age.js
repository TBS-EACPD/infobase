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

import { businessConstants } from "src/models/businessConstants";
import {
  useOrgPeopleSummary,
  useGovPeopleSummary,
} from "src/models/people/queries";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { formats } from "src/core/format";

import { lang } from "src/core/injected_build_constants";

import { NivoLineBarToggle } from "src/charts/wrapped_nivo/index";

import { calculate_common_text_args } from "./calculate_common_text_args";

import text from "./employee_age.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { age_groups } = businessConstants;

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

    // Process age_group data with correct labels from businessConstants
    const age_group = data.age_group
      .filter((group) => group && group.yearly_data)
      .map((row) => {
        // Map the dimension to the correct age_groups constant
        let mappedDimension = row.dimension;
        let businessConstantKey = null;

        // More comprehensive mapping for granular age ranges
        if (
          row.dimension.includes("<20") ||
          row.dimension.includes("20-24") ||
          row.dimension.includes("25-29") ||
          row.dimension.match(/^(Under|Moins de) 30/) ||
          row.dimension.match(/^(Age 29 and less|29 ans et moins)$/)
        ) {
          businessConstantKey = "age30less";
        } else if (
          row.dimension.includes("30-34") ||
          row.dimension.includes("35-39") ||
          row.dimension.match(/^(30 to 39|30 à 39)/) ||
          row.dimension.match(/^(Age 30 to 39|30 à 39 ans)$/)
        ) {
          businessConstantKey = "age30to39";
        } else if (
          row.dimension.includes("40-44") ||
          row.dimension.includes("45-49") ||
          row.dimension.match(/^(40 to 49|40 à 49)/) ||
          row.dimension.match(/^(Age 40 to 49|40 à 49 ans)$/)
        ) {
          businessConstantKey = "age40to49";
        } else if (
          row.dimension.includes("50-54") ||
          row.dimension.includes("55-59") ||
          row.dimension.match(/^(50 to 59|50 à 59)/) ||
          row.dimension.match(/^(Age 50 to 59|50 à 59 ans)$/)
        ) {
          businessConstantKey = "age50to59";
        } else if (
          row.dimension.includes("60-64") ||
          row.dimension.includes("65+") ||
          row.dimension.includes("≥65") ||
          row.dimension.match(/^(60 and over|60 ans et plus)/) ||
          row.dimension.match(/^(Age 60 and over|60 ans et plus)$/)
        ) {
          businessConstantKey = "age60plus";
        } else if (row.dimension.match(/^(Not Available|Non disponible)$/i)) {
          businessConstantKey = "na";
        } else if (
          row.dimension.match(/^(Suppressed Data|Données supprimées)$/i)
        ) {
          businessConstantKey = "sup";
        }

        // If we found a mapping, use the text from the business constant
        if (businessConstantKey && age_groups[businessConstantKey]) {
          mappedDimension = age_groups[businessConstantKey].text;
        }

        return {
          label: mappedDimension,
          data: row.yearly_data
            .filter((entry) => entry)
            .map((entry) => entry.value),
          five_year_percent: row.avg_share,
          active: true,
        };
      })
      .filter((group) =>
        _.some(group.data, (val) => val !== null && val !== 0)
      );

    // Consolidate age groups to match business constants
    const consolidatedGroups = {};

    // Initialize groups from business constants
    Object.keys(age_groups).forEach((key) => {
      consolidatedGroups[age_groups[key].text] = {
        label: age_groups[key].text,
        data: new Array(5).fill(0),
        five_year_percent: 0,
        active: true,
        count: 0,
      };
    });

    // Sum up data for each consolidated group
    age_group.forEach((group) => {
      if (consolidatedGroups[group.label]) {
        const target = consolidatedGroups[group.label];

        // Sum the data arrays
        group.data.forEach((value, index) => {
          if (value !== null && !isNaN(value)) {
            target.data[index] = (target.data[index] || 0) + value;
          }
        });

        // Accumulate five_year_percent for averaging later
        if (
          group.five_year_percent !== null &&
          !isNaN(group.five_year_percent)
        ) {
          target.five_year_percent += group.five_year_percent || 0;
          target.count++;
        }
      }
    });

    // Calculate averages and convert to array
    const finalAgeGroups = Object.values(consolidatedGroups)
      .map((group) => ({
        label: group.label,
        data: group.data,
        five_year_percent:
          group.count > 0 ? group.five_year_percent / group.count : 0,
        active: true,
      }))
      .filter((group) => _.some(group.data, (val) => val !== null && val !== 0))
      .sort((a, b) => {
        // Sort by age group order
        const ageOrder = {
          [age_groups.age30less.text]: 1,
          [age_groups.age30to39.text]: 2,
          [age_groups.age40to49.text]: 3,
          [age_groups.age50to59.text]: 4,
          [age_groups.age60plus.text]: 5,
          [age_groups.na.text]: 6,
          [age_groups.sup.text]: 7,
        };

        return (ageOrder[a.label] || 99) - (ageOrder[b.label] || 99);
      });

    // Process average_age data
    const avg_age = [];

    // Add department data if available
    if (data.average_age && data.average_age.length > 0) {
      avg_age.push({
        label: subject.name,
        data: data.average_age
          .filter((entry) => entry)
          .map((entry) => entry.value),
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
          .map((entry) => entry.value),
        active: true,
      });
    }

    return {
      avg_age,
      age_group: finalAgeGroups,
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

  // Options for NivoLineBarToggle React components
  const age_group_options = {
    legend_title: text_maker("age_group"),
    bar: true,
    graph_options: {
      ticks: ticks,
      y_axis: text_maker("employees"),
      formatter: formats.big_int_raw,
      responsive: true,
      animate: window.matchMedia("(prefers-reduced-motion: no-preference)")
        .matches,
      role: "img",
      ariaLabel: `${text_maker("age_group")} ${subject.name}`,
    },
    initial_graph_mode: "bar_grouped",
    data: calculations.age_group,
  };

  const avg_age_options = {
    legend_title: text_maker("legend"),
    bar: false,
    graph_options: {
      ticks: ticks,
      y_axis: text_maker("avgage"),
      formatter: formats.int,
      responsive: true,
      animate: window.matchMedia("(prefers-reduced-motion: no-preference)")
        .matches,
      role: "img",
      ariaLabel: `${text_maker("avgage")} ${subject.name}`,
    },
    disable_toggle: true,
    initial_graph_mode: "line",
    data: calculations.avg_age,
    formatter: formats.decimal2,
  };

  const has_suppressed_data = _.some(
    calculations.age_group,
    (data) => data.label === age_groups.sup.text
  );

  const required_footnotes = (() => {
    if (has_suppressed_data) {
      return footnotes;
    } else {
      return _.filter(
        footnotes,
        (footnote) =>
          !_.some(footnote.topic_keys, (key) => key === "SUPPRESSED_DATA")
      );
    }
  })();

  return (
    console.log(text_calculations),
    (
      <StdPanel
        {...{ title, footnotes: required_footnotes, sources, datasets }}
      >
        <Col size={12} isText>
          <TM
            k={subject_type + "_employee_age_text"}
            args={text_calculations}
          />
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
    )
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
