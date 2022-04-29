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

import text from "./employee_fol.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = year_templates;
const { fol } = businessConstants;

const calculate_funcs_by_subject_type = {
  gov: ({ tables }) => {
    const { orgEmployeeFol } = tables;

    const gov_five_year_total_head_count = _.chain(orgEmployeeFol.GOC)
      .map((row) =>
        _.chain(row)
          .pick(people_years)
          .reduce((sum, value) => value + sum, 0)
          .value()
      )
      .reduce((sum, value) => value + sum, 0)
      .value();

    return _.chain(fol)
      .values()
      .map((fol_type) => {
        const fol_text = fol_type.text;
        const yearly_values = people_years.map(
          (year) =>
            orgEmployeeFol.sum_cols_by_grouped_data(year, "fol")[fol_text]
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
  dept: ({ subject, tables }) => {
    const { orgEmployeeFol } = tables;
    return _.chain(orgEmployeeFol.q(subject).data)
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
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => ({
      legacy_table_dependencies: ["orgEmployeeFol"],
      get_dataset_keys: () => ["employee_fol"],
      calculate: calculate_funcs_by_subject_type[subject_type],
      get_title: () => text_maker("employee_fol_title"),
      render({ title, subject, calculations, footnotes, sources, datasets }) {
        const text_groups = (() => {
          const has_eng_data = _.some(
            calculations,
            ({ label }) => label === fol.eng.text
          );
          const has_fr_data = _.some(
            calculations,
            ({ label }) => label === fol.fre.text
          );
          const has_eng_fr_data = has_eng_data && has_fr_data;

          if (has_eng_fr_data) {
            return _.filter(
              calculations,
              ({ label }) => label === fol.eng.text || label === fol.fre.text
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

        const has_suppressed_data = _.some(
          calculations,
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
            {...{ title, footnotes: required_footnotes, sources, datasets }}
          >
            <Col size={12} isText>
              <TM
                k={subject_type + "_employee_fol_text"}
                args={text_calculations}
              />
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
                  data: calculations,
                }}
              />
            </Col>
          </StdPanel>
        );
      },
    }),
  });
