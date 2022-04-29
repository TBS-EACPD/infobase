import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component } from "src/components/index";

import { businessConstants } from "src/models/businessConstants";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { formats } from "src/core/format";

import { NivoLineBarToggle } from "src/charts/wrapped_nivo/index";

import { calculate_common_text_args } from "./calculate_common_text_args";

import text from "./employee_type.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { tenure } = businessConstants;

const calculate_funcs_by_subject_type = {
  gov: ({ tables }) => {
    const { orgEmployeeType } = tables;
    return _.chain(tenure)
      .values()
      .map((tenure_type) => {
        const tenure_text = tenure_type.text;
        const yearly_values = people_years.map(
          (year) =>
            orgEmployeeType.sum_cols_by_grouped_data(year, "employee_type")[
              tenure_text
            ]
        );
        return {
          label: tenure_text,
          data: yearly_values,
          five_year_percent:
            yearly_values.reduce(function (sum, val) {
              return sum + val;
            }, 0) /
            _.sum(orgEmployeeType.q().sum(people_years, { as_object: false })),
          active: true,
        };
      })
      .sortBy((d) => -sum(d.data))
      .value();
  },
  dept: ({ subject, tables }) => {
    const { orgEmployeeType } = tables;
    return _.chain(orgEmployeeType.q(subject).data)
      .map((row) => ({
        label: row.employee_type,
        data: people_years.map((year) => row[year]),
        five_year_percent: row.five_year_percent,
        active: true,
      }))
      .filter((d) => sum(d.data) !== 0)
      .sortBy((d) => -sum(d.data))
      .value();
  },
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
      calculate: calculate_funcs_by_subject_type[subject_type],

      render({
        title,
        subject,
        calculations,
        footnotes,
        sources,
        datasets,
        glossary_keys,
      }) {
        const student = _.find(
          calculations,
          (type) => type.label === text_maker("student")
        );

        const student_data = student && student.data;

        const common_text_args = calculate_common_text_args(calculations);

        const sum_emp_first_active_year = _.chain(calculations)
          .map((type) => type.data[common_text_args.first_active_year_index])
          .sum()
          .value();

        const sum_emp_last_active_year = _.chain(calculations)
          .map((type) => type.data[common_text_args.last_active_year_index])
          .sum()
          .value();

        const student_first_active_year_pct = student_data
          ? student_data[common_text_args.first_active_year_index] /
            sum_emp_first_active_year
          : 0;
        const student_last_active_year_pct = student_data
          ? student_data[common_text_args.last_active_year_index] /
            sum_emp_last_active_year
          : 0;

        const text_calculations = {
          ...common_text_args,
          student_first_active_year_pct,
          student_last_active_year_pct,
          subject,
        };

        const ticks = _.map(people_years, (y) => `${run_template(y)}`);

        return (
          <StdPanel {...{ title, footnotes, sources, datasets, glossary_keys }}>
            <Col size={12} isText>
              <TM
                k={subject_type + "_employee_type_text"}
                args={text_calculations}
              />
            </Col>
            <Col size={12} isGraph>
              <NivoLineBarToggle
                {...{
                  legend_title: text_maker("employee_type"),
                  bar: true,
                  graph_options: {
                    ticks: ticks,
                    y_axis: text_maker("employees"),
                    formatter: formats.big_int_raw,
                  },
                  initial_graph_mode: "bar_stacked",
                  data: calculations,
                }}
              />
            </Col>
          </StdPanel>
        );
      },
    }),
  });
