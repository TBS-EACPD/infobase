import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { TextPanel } from "src/panels/panel_declarations/InfographicPanel";

import { create_text_maker_component, CardList } from "src/components/index";

import { Table } from "src/core/TableClass";

import { rpb_link } from "src/rpb/rpb_link";

import text from "./rpb_links.yaml";

const { text_maker, TM } = create_text_maker_component([text]);

const people_table_ids = [
  "orgEmployeeType",
  "orgEmployeeRegion",
  "orgEmployeeAgeGroup",
  "orgEmployeeExLvl",
  "orgEmployeeGender",
  "orgEmployeeFol",
  "orgEmployeeAvgAge",
];

const get_table_type = (table) =>
  _.includes(people_table_ids, table.id)
    ? text_maker("people")
    : text_maker("finances");

const common_panel_config = {
  footnotes: false,
  title: text_maker("links_to_rpb_title"),
};

export const declare_links_to_rpb_panel = () =>
  declare_panel({
    panel_key: "links_to_rpb",
    levels: ["gov", "dept"],

    panel_config_func: (level, panel_key) => {
      switch (level) {
        case "gov":
          return {
            ...common_panel_config,
            calculate: _.constant(true),

            render({ title, calculations }) {
              const { subject } = calculations;

              const list_args = _.chain(Table.store.get_all())
                .reject("reference_table")
                .groupBy(get_table_type)
                .map((group_of_tables, table_type_title) => ({
                  display: (
                    <strong
                      dangerouslySetInnerHTML={{ __html: table_type_title }}
                    />
                  ),
                  children: _.chain(group_of_tables)
                    .map((table) => ({
                      href: rpb_link({
                        subject: subject.guid,
                        table: table.id,
                      }),
                      display: table.name,
                    }))
                    .sortBy("display")
                    .value(),
                }))
                .value();

              return (
                <TextPanel title={title}>
                  <TM k="links_to_rpb_text" />
                  <CardList elements={list_args} />
                </TextPanel>
              );
            },
          };
        case "dept":
          return {
            ...common_panel_config,
            calculate(subject) {
              return !subject.has_table_data;
            },

            render({ title, calculations }) {
              const { subject } = calculations;

              const list_args = _.chain(subject.table_ids)
                .map((id) => Table.store.lookup(id))
                .compact()
                .groupBy(get_table_type)
                .map((group_of_tables, table_type_title) => ({
                  display: (
                    <strong
                      dangerouslySetInnerHTML={{ __html: table_type_title }}
                    />
                  ),
                  children: _.chain(group_of_tables)
                    .map((table) => ({
                      href: rpb_link({
                        subject: subject.guid,
                        table: table.id,
                        mode: "details",
                      }),
                      display: table.name,
                    }))
                    .sortBy("display")
                    .value(),
                }))
                .value();

              return (
                <TextPanel title={title}>
                  <TM k="links_to_rpb_text" />
                  <CardList elements={list_args} />
                </TextPanel>
              );
            },
          };
      }
    },
  });
