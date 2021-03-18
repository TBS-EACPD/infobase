import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import {
  StdPanel,
  Col,
} from "src/panels/panel_declarations/InfographicPanel.js";
import {
  TabbedContent,
  create_text_maker_component,
} from "src/panels/panel_declarations/shared.js";

import { GraphOverlay } from "src/components/index.js";

import { businessConstants } from "src/models/businessConstants.js";
import { Subject } from "src/models/subject.js";
import { run_template } from "src/models/text.js";

import { year_templates } from "src/models/years.js";

import { formats } from "src/core/format.js";

import { lang } from "src/core/injected_build_constants.js";

import { NivoLineBarToggle } from "src/charts/wrapped_nivo/index.js";

import { calculate_common_text_args } from "./calculate_common_text_args.js";

import text from "./employee_age.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { age_groups } = businessConstants;

const calculate_funcs_by_level = {
  gov: function (gov) {
    const { orgEmployeeAgeGroup } = this.tables;
    const { orgEmployeeAvgAge } = this.tables;

    const avg_age = [
      {
        label: text_maker("fps"),
        data: people_years.map((year) => orgEmployeeAvgAge.GOC[0][year]),
        active: true,
      },
    ];

    const gov_five_year_total_head_count = _.chain(
      orgEmployeeAgeGroup.q().gov_grouping()
    )
      .map((row) => sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    const age_group = _.map(age_groups, ({ text: age_range }) => {
      const yearly_values = people_years.map(
        (year) => orgEmployeeAgeGroup.horizontal(year, false)[age_range]
      );
      return {
        label: age_range,
        active: true,
        data: yearly_values,
        five_year_percent:
          yearly_values.reduce(function (sum, val) {
            return sum + val;
          }, 0) / gov_five_year_total_head_count,
      };
    });

    return {
      avg_age: avg_age,
      age_group: age_group,
    };
  },
  dept: function (dept) {
    const { orgEmployeeAgeGroup } = this.tables;
    const { orgEmployeeAvgAge } = this.tables;

    const avg_age = _.chain(orgEmployeeAvgAge.q(dept).data)
      .map((row) => ({
        label: Subject.Dept.lookup(row.dept).name,
        data: people_years.map((year) => row[year]),
        active: true,
      }))
      .filter((d) => sum(d.data) !== 0)
      .concat({
        label: text_maker("fps"),
        data: people_years.map((year) => orgEmployeeAvgAge.GOC[0][year]),
        active: true,
      })
      .sortBy((d) => -sum(d.data))
      .value();

    const age_group = _.chain(orgEmployeeAgeGroup.q(dept).data)
      .map((row) => ({
        label: row.age,
        data: people_years.map((year) => row[year]),
        five_year_percent: row.five_year_percent,
        active: true,
      }))
      .filter((d) => sum(d.data) !== 0)
      .value();

    return {
      avg_age: avg_age,
      age_group: age_group,
    };
  },
};

export const declare_employee_age_panel = () =>
  declare_panel({
    panel_key: "employee_age",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeAgeGroup", "orgEmployeeAvgAge"],
      calculate: calculate_funcs_by_level[level],

      render({ calculations, footnotes, sources }) {
        const { panel_args, subject } = calculations;

        const { avg_age, age_group } = panel_args;

        const dept_avg_first_active_year =
          avg_age.length > 1 ? _.first(avg_age[1].data) : null;
        const dept_avg_last_active_year =
          avg_age.length > 1 ? _.last(avg_age[1].data) : null;
        const gov_avgage_last_year_5 = _.first(avg_age[0].data);
        const gov_avgage_last_year = _.last(avg_age[0].data);

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
          },
          initial_graph_mode: "bar_grouped",
          data: panel_args.age_group,
        };
        const avg_age_options = {
          legend_title: text_maker("legend"),
          bar: false,
          graph_options: {
            ticks: ticks,
            y_axis: text_maker("avgage"),
            formatter: formats.int,
          },
          disable_toggle: true,
          initial_graph_mode: "line",
          data: panel_args.avg_age,
          formatter: formats.decimal2,
        };

        const has_suppressed_data = _.some(
          panel_args.age_group,
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
          <StdPanel
            title={text_maker("employee_age_title")}
            {...{ footnotes: required_footnotes, sources }}
          >
            <Col size={12} isText>
              <TM k={level + "_employee_age_text"} args={text_calculations} />
            </Col>
            <Col size={12} isGraph extraClasses="zero-padding">
              <TabbedContent
                tab_keys={["age_group", "avgage"]}
                tab_labels={{
                  age_group: text_maker("age_group"),
                  avgage: text_maker("avgage"),
                }}
                tab_pane_contents={{
                  age_group: (
                    <div id={"emp_age_tab_pane"}>
                      <GraphOverlay>
                        <NivoLineBarToggle {...age_group_options} />
                      </GraphOverlay>
                      <div className="clearfix"></div>
                    </div>
                  ),
                  avgage: (
                    <div id={"emp_age_tab_pane"}>
                      <NivoLineBarToggle {...avg_age_options} />
                      <div className="clearfix"></div>
                    </div>
                  ),
                }}
              />
            </Col>
          </StdPanel>
        );
      },
    }),
  });
