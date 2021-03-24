import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import {
  StdPanel,
  Col,
} from "src/panels/panel_declarations/InfographicPanel.js";

import { create_text_maker_component } from "src/components/index.js";

import { businessConstants } from "src/models/businessConstants.js";
import { run_template } from "src/models/text.js";
import { year_templates } from "src/models/years.js";

import { formats } from "src/core/format.js";

import { NivoLineBarToggle } from "src/charts/wrapped_nivo/index.js";

import { calculate_common_text_args } from "./calculate_common_text_args.js";

import text from "./employee_fol.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { fol } = businessConstants;

const calculate_funcs_by_level = {
  gov: function (gov) {
    const { orgEmployeeFol } = this.tables;

    const gov_five_year_total_head_count = _.chain(
      orgEmployeeFol.q().gov_grouping()
    )
      .map((row) => sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.chain(fol)
      .values()
      .map((fol_type) => {
        const fol_text = fol_type.text;
        const yearly_values = people_years.map(
          (year) => orgEmployeeFol.horizontal(year, false)[fol_text]
        );
        return {
          label: fol_text,
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
    const { orgEmployeeFol } = this.tables;
    return _.chain(orgEmployeeFol.q(dept).data)
      .map((row) => ({
        label: row.fol,
        data: people_years.map((year) => row[year]),
        five_year_percent: row.five_year_percent,
        active: true,
      }))
      .filter((d) => sum(d.data) !== 0)
      .sortBy((d) => -sum(d.data))
      .value();
  },
};

export const declare_employee_fol_panel = () =>
  declare_panel({
    panel_key: "employee_fol",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeFol"],
      calculate: calculate_funcs_by_level[level],

      render({ calculations, footnotes, sources }) {
        const { panel_args, subject } = calculations;

        const text_groups = (() => {
          const has_eng_data = _.some(
            panel_args,
            ({ label }) => label === fol.eng.text
          );
          const has_fr_data = _.some(
            panel_args,
            ({ label }) => label === fol.fre.text
          );
          const has_eng_fr_data = has_eng_data && has_fr_data;

          if (has_eng_fr_data) {
            return _.filter(
              panel_args,
              ({ label }) => label === fol.eng.text || label === fol.fre.text
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
          (graph_arg) => graph_arg.label === fol.sup.text
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
            title={text_maker("employee_fol_title")}
            {...{ footnotes: required_footnotes, sources }}
          >
            <Col size={12} isText>
              <TM k={level + "_employee_fol_text"} args={text_calculations} />
            </Col>
            <Col size={12} isGraph>
              <NivoLineBarToggle
                {...{
                  legend_title: text_maker("FOL"),
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
