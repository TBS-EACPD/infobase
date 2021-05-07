import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import {
  StdPanel,
  Col,
} from "src/panels/panel_declarations/InfographicPanel.js";

import { create_text_maker_component } from "src/components/index.js";

import { businessConstants } from "src/models/businessConstants.ts";
import { run_template } from "src/models/text.js";
import { year_templates } from "src/models/years.js";

import { formats } from "src/core/format.ts";

import { NivoLineBarToggle } from "src/charts/wrapped_nivo/index.js";

import { calculate_common_text_args } from "./calculate_common_text_args.js";

import text from "./employee_gender.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { gender } = businessConstants;

const calculate_funcs_by_level = {
  gov: function (gov) {
    const { orgEmployeeGender } = this.tables;

    const gov_five_year_total_head_count = _.chain(
      orgEmployeeGender.q().gov_grouping()
    )
      .map((row) => sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.chain(gender)
      .values()
      .map((gender_type) => {
        const gender_text = gender_type.text;
        const yearly_values = people_years.map(
          (year) => orgEmployeeGender.horizontal(year, false)[gender_text]
        );
        return {
          label: gender_text,
          data: yearly_values,
          five_year_percent:
            yearly_values.reduce(function (sum, val) {
              return sum + val;
            }, 0) / gov_five_year_total_head_count,
          active: true,
        };
      })
      .sortBy((d) => -sum(d.data))
      .value();
  },
  dept: function (dept) {
    const { orgEmployeeGender } = this.tables;
    return _.chain(orgEmployeeGender.q(dept).data)
      .map((row) => ({
        label: row.gender,
        data: people_years.map((year) => row[year]),
        five_year_percent: row.five_year_percent,
        active: true,
      }))
      .filter((d) => sum(d.data) !== 0)
      .sortBy((d) => -sum(d.data))
      .value();
  },
};

export const declare_employee_gender_panel = () =>
  declare_panel({
    panel_key: "employee_gender",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeGender"],
      calculate: calculate_funcs_by_level[level],
      title: text_maker("employee_gender_title"),
      render({ title, calculations, footnotes, sources }) {
        const { panel_args, subject } = calculations;

        const text_groups = (() => {
          const has_male_data = _.some(
            panel_args,
            ({ label }) => label === gender.male.text
          );
          const has_female_data = _.some(
            panel_args,
            ({ label }) => label === gender.female.text
          );
          const has_male_female_data = has_male_data && has_female_data;

          if (has_male_female_data) {
            return _.filter(
              panel_args,
              ({ label }) =>
                label === gender.male.text || label === gender.female.text
            );
          } else {
            const sorted_groups = _.sortBy(panel_args, "five_year_percent");
            return _.uniq([_.head(sorted_groups), _.last(sorted_groups)]);
          }
        })();

        const text_calculations = {
          ...calculate_common_text_args(text_groups),
          single_type_flag: text_groups.length === 1,
          subject,
        };

        const ticks = _.map(people_years, (y) => `${run_template(y)}`);

        const has_suppressed_data = _.some(
          panel_args,
          (graph_arg) => graph_arg.label === gender.sup.text
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
          <StdPanel {...{ title, footnotes: required_footnotes, sources }}>
            <Col size={12} isText>
              <TM
                k={level + "_employee_gender_text"}
                args={text_calculations}
              />
            </Col>
            <Col size={12} isGraph>
              <NivoLineBarToggle
                {...{
                  legend_title: text_maker("employee_gender"),
                  bar: true,
                  graph_options: {
                    y_axis: text_maker("employees"),
                    ticks: ticks,
                    formatter: formats.big_int_raw,
                  },
                  initial_graph_mode: "bar_grouped",
                  data: panel_args,
                }}
              />
            </Col>
          </StdPanel>
        );
      },
    }),
  });
