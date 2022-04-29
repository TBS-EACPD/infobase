import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  Format,
  DisplayTable,
} from "src/components/index";

import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { textGreen, textRed } from "src/style_constants/index";

import text from "./dp_rev_split.yaml";

const { text_maker } = create_text_maker_component(text);

const { planning_years } = year_templates;

const special_cols = _.flatMap(planning_years, (year) => [
  `${year}_gross`,
  `${year}_rev`,
  `${year}_spa`,
]);
const dp_cols = [...planning_years, ...special_cols];

const spending_formatter = (value) => (
  <Format
    style={{ color: textGreen }}
    type={"compact2_written"}
    content={value}
  />
);

const revenue_formatter = (value) => (
  <Format
    style={{ color: textRed }}
    type={"compact2_written"}
    content={value}
  />
);

export const declare_dp_rev_split_panel = () =>
  declare_panel({
    panel_key: "dp_rev_split",
    subject_types: ["dept", "crso", "program"],
    panel_config_func: () => ({
      legacy_table_dependencies: ["programSpending"],
      get_dataset_keys: () => ["program_spending"],
      get_title: () => text_maker("dp_rev_split_title"),
      machinery_footnotes: false,
      footnotes: ["PLANNED_GROSS", "PLANNED_EXP", "PLANNED_FTE"],
      glossary_keys: ["SPA"],
      calculate: ({ subject, tables }) => {
        const { programSpending } = tables;
        const q = programSpending.q(subject);

        const data = _.map(dp_cols, (col) => ({
          col,
          value: q.sum(col),
        }));

        const has_special_vals = _.chain(data)
          .filter(({ col }) => _.endsWith(col, "spa") || _.endsWith(col, "rev"))
          .map("value")
          .some()
          .value();

        if (!has_special_vals) {
          return false;
        }
        const find_year_data_ends_with = (year_data, end_str) =>
          _.find(year_data, ({ col }) => _.endsWith(col, end_str)).value;

        const table_data = _.map(planning_years, (yr) => {
          const year_data = _.filter(data, ({ col }) => _.startsWith(col, yr));
          return {
            year: run_template(yr),
            net: _.find(year_data, { col: yr }).value,
            gross: find_year_data_ends_with(year_data, "_gross"),
            spa: find_year_data_ends_with(year_data, "_spa"),
            rev: find_year_data_ends_with(year_data, "_rev"),
          };
        });

        const column_configs = {
          year: {
            index: 0,
            header: text_maker("year"),
            formatter: (value) => (
              <span style={{ fontWeight: "bold" }}> {value} </span>
            ),
          },
          gross: {
            index: 1,
            header: text_maker("dp_gross"),
            is_summable: true,
            formatter: spending_formatter,
          },
          spa: {
            index: 2,
            header: text_maker("dp_spa"),
            is_summable: true,
            formatter: spending_formatter,
            initial_visible:
              _.filter(table_data, (row) => row.spa === 0).length === 0,
          },
          rev: {
            index: 3,
            header: text_maker("dp_revenue"),
            is_summable: true,
            formatter: revenue_formatter,
          },
          net: {
            index: 4,
            header: text_maker("dp_net"),
            is_summable: true,
            formatter: "compact2_written",
          },
        };

        return {
          table_data,
          column_configs,
        };
      },
      render({ title, calculations, footnotes, sources, glossary_keys }) {
        const { table_data, column_configs } = calculations;

        return (
          <InfographicPanel {...{ title, footnotes, sources, glossary_keys }}>
            <DisplayTable
              table_name={text_maker("dp_rev_split_title")}
              data={table_data}
              column_configs={column_configs}
            />
          </InfographicPanel>
        );
      },
    }),
  });
