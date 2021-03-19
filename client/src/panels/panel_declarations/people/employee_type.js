import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import {StdPanel, Col} from "src/panels/panel_declarations/InfographicPanel.js";

import * as util_components from "src/components/index.js";

const { create_text_maker_component } = util_components;


import { businessConstants } from "src/models/businessConstants.js";
import {run_template} from "src/models/text.js";
import {year_templates} from "src/models/years.js";

import {formats} from "src/core/format.js";

import {NivoLineBarToggle} from "src/charts/wrapped_nivo/index.js";

import { calculate_common_text_args } from "./calculate_common_text_args.js";

import text from "./employee_type.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { tenure } = businessConstants;

const calculate_funcs_by_level = {
  gov: function (gov) {
    const { orgEmployeeType } = this.tables;
    return _.chain(tenure)
      .values()
      .map((tenure_type) => {
        const tenure_text = tenure_type.text;
        const yearly_values = people_years.map(
          (year) => orgEmployeeType.horizontal(year, false)[tenure_text]
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
  dept: function (dept) {
    const { orgEmployeeType } = this.tables;
    return _.chain(orgEmployeeType.q(dept).data)
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
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeType"],
      glossary_keys: [
        "INDET_PEOPLE",
        "TERM_PEOPLE",
        "CASUAL_PEOPLE",
        "STUD_PEOPLE",
      ],
      calculate: calculate_funcs_by_level[level],

      render({ calculations, footnotes, sources, glossary_keys }) {
        const { panel_args, subject } = calculations;

        const student = _.find(
          panel_args,
          (type) => type.label === text_maker("student")
        );

        const student_data = student && student.data;

        const common_text_args = calculate_common_text_args(panel_args);

        const sum_emp_first_active_year = _.chain(panel_args)
          .map((type) => type.data[common_text_args.first_active_year_index])
          .sum()
          .value();

        const sum_emp_last_active_year = _.chain(panel_args)
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
          <StdPanel
            title={text_maker("employee_type_title")}
            {...{ footnotes, sources, glossary_keys }}
          >
            <Col size={12} isText>
              <TM k={level + "_employee_type_text"} args={text_calculations} />
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
                  data: panel_args,
                }}
              />
            </Col>
          </StdPanel>
        );
      },
    }),
  });
