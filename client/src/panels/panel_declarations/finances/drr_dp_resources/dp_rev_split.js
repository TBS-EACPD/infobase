import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import { create_text_maker_component , Format, SmartDisplayTable } from "src/components/index.js";



import { run_template } from "src/models/text.js";
import { year_templates } from "src/models/years.js";

import { textGreen, textRed } from "src/core/color_defs.js";

import { get_source_links } from "src/metadata/data_sources.js";

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

const revenue_formatter = (value, custom_color = null) => (
  <Format
    style={{ color: textRed }}
    type={"compact2_written"}
    content={value}
  />
);

export const declare_dp_rev_split_panel = () =>
  declare_panel({
    panel_key: "dp_rev_split",
    levels: ["dept", "crso", "program"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["programSpending"],
      machinery_footnotes: false,
      footnotes: ["PLANNED_GROSS", "PLANNED_EXP", "PLANNED_FTE"],
      glossary_keys: ["SPA"],
      source: (subject) => get_source_links(["DP"]),
      calculate(subject) {
        const { programSpending } = this.tables;
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
      render({ calculations, footnotes, sources, glossary_keys }) {
        const { panel_args } = calculations;
        const { table_data, column_configs } = panel_args;

        return (
          <InfographicPanel
            title={text_maker("dp_rev_split_title")}
            {...{ footnotes, sources, glossary_keys }}
          >
            <SmartDisplayTable
              table_name={text_maker("dp_rev_split_title")}
              data={table_data}
              column_configs={column_configs}
            />
          </InfographicPanel>
        );
      },
    }),
  });
