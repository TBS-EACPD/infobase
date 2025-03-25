import _ from "lodash";
import React from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { businessConstants } from "src/models/businessConstants";
import {
  useOrgPeopleSummary,
  useGovPeopleSummary,
} from "src/models/people/queries";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { formats } from "src/core/format";

import { NivoLineBarToggle } from "src/charts/wrapped_nivo/index";

import { calculate_common_text_args } from "./calculate_common_text_args";

import text from "./employee_executive_level.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;

const formatExLevel = (level) => {
  // Convert to lowercase and trim spaces
  const normalized = level.toLowerCase().trim();

  // Handle Non-EX case
  if (normalized === "non-ex") {
    return "non";
  }

  // Handle EX cases (ex   01 -> ex1)
  if (normalized.startsWith("ex")) {
    // Remove all spaces and leading zeros
    return normalized.replace(/\s+/g, "").replace("0", "");
  }

  return normalized;
};

const EmployeeExecutiveLevelPanel = ({
  title,
  subject,
  footnotes,
  sources = [],
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

  if (!data || !data.ex_lvl) {
    return null;
  }

  if (data.ex_lvl.length === 0) {
    return null;
  }

  const formatted_data = data.ex_lvl.map((level) => ({
    label: businessConstants.ex_levels[formatExLevel(level.dimension)].text,
    data: level.yearly_data.map((year) => year.value),
    five_year_percent: level.avg_share,
    active: formatExLevel(level.dimension) !== "non",
  }));

  const has_non_ex_only = _.chain(formatted_data)
    .filter(({ label }) => label !== "Non-EX")
    .isEmpty()
    .value();

  const text_calculations = (() => {
    if (has_non_ex_only) {
      return {
        ...calculate_common_text_args(formatted_data),
        subject,
        avg_num_non_ex: _.chain(formatted_data)
          .first(({ label }) => label === "Non-EX")
          .thru(({ data }) => _.mean(data))
          .value(),
      };
    } else {
      const ex_only_series = _.filter(
        formatted_data,
        ({ label }) => label !== "Non-EX"
      );

      const sum_exec = _.reduce(
        ex_only_series,
        (result, ex_lvl) => result + _.sum(ex_lvl.data),
        0
      );

      const common_text_args = calculate_common_text_args(
        ex_only_series,
        sum_exec
      );

      const { first_active_year_index, last_active_year_index } =
        common_text_args;

      const avg_num_employees =
        _.reduce(
          formatted_data,
          (result, ex_lvl) => result + _.sum(ex_lvl.data),
          0
        ) /
        (last_active_year_index - first_active_year_index + 1);

      const avg_num_execs =
        sum_exec / (last_active_year_index - first_active_year_index + 1);
      const avg_pct_execs = avg_num_execs / avg_num_employees;

      return {
        ...common_text_args,
        subject,
        avg_num_execs,
        avg_pct_execs,
      };
    }
  })();

  const ticks = _.map(people_years, (y) => `${run_template(y)}`);

  return (
    <StdPanel {...{ title, footnotes, sources, datasets }}>
      {loading ? (
        <LeafSpinner config_name="subroute" />
      ) : (
        <>
          <Col size={12} isText>
            <TM
              k={
                has_non_ex_only
                  ? "all_non_executive_employee_text"
                  : `${subject_type}_employee_executive_level_text`
              }
              args={text_calculations}
            />
          </Col>
          <Col size={12} isGraph>
            <NivoLineBarToggle
              {...{
                legend_title: text_maker("ex_level"),
                bar: true,
                graph_options: {
                  y_axis: text_maker("employees"),
                  ticks: ticks,
                  formatter: formats.big_int_raw,
                },
                initial_graph_mode: "bar_stacked",
                data: formatted_data,
              }}
            />
          </Col>
        </>
      )}
    </StdPanel>
  );
};

export const declare_employee_executive_level_panel = () =>
  declare_panel({
    panel_key: "employee_executive_level",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => ({
      get_dataset_keys: () => ["ex_level"],
      get_title: () => text_maker("employee_executive_level_title"),
      render(props) {
        return (
          <EmployeeExecutiveLevelPanel {...props} subject_type={subject_type} />
        );
      },
    }),
  });
