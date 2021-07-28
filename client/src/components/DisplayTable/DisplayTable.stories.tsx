import { Story, Meta } from "@storybook/react";
import _ from "lodash";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { DisplayTable, CellValue } from "./DisplayTable";

export default {
  title: "Tables/DisplayTable",
  component: DisplayTable,
} as Meta;

type DisplayTableProps = ComponentProps<typeof DisplayTable>;

const Template: Story<DisplayTableProps> = (args) => {
  return <DisplayTable {...args} />;
};

const common_data = [
  { label: "Italy", price: 9 },
  { label: "Korea", price: 9 },
  { label: "Canada", price: 10 },
  { label: "United_States", price: 11 },
  { label: "United_Kingdom", price: 10 },
];

const common_column_configs = {
  label: {
    index: 0,
    header: "Pizza type",
    is_searchable: true,
    formatter: _.identity,
  },
  price: {
    index: 1,
    header: "Price",
    is_sortable: true,
    formatter: _.identity,
  },
};

export const Basic = Template.bind({});
Basic.args = {
  data: common_data,
  column_configs: common_column_configs,
};

const country_lookup: Record<string, string> = {
  Italy: "Italy",
  Korea: "Korea",
  Canada: "Canada",
  United_States: "United States",
  United_Kingdom: "United Kingdom",
};

const table_with_URL_column_configs = {
  ...common_column_configs,
  label: {
    ...common_column_configs.label,
    formatter: (id: CellValue) => (
      <a
        href={`https://en.wikipedia.org/wiki/List_of_pizza_varieties_by_country#${id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {typeof id === "string" ? country_lookup[id] : <></>}
      </a>
    ),
  },
};
export const TableWithURL = Template.bind({});
TableWithURL.args = {
  data: common_data,
  column_configs: table_with_URL_column_configs,
};

const custom_utils = {
  downloadCsvUtil: <></>,
  random_button: (
    <button
      key={"random_button"}
      onClick={() => console.log("clicked")}
      style={{ backgroundColor: "white", color: "black" }}
    >
      Random Button
    </button>
  ),
};

export const CustomUtils = Template.bind({});
CustomUtils.args = {
  data: common_data,
  column_configs: common_column_configs,
  util_components: custom_utils,
};

export const Pagination = Template.bind({});
Pagination.args = {
  data: common_data,
  column_configs: common_column_configs,
  page_size_increment: 2,
  page_size_num_options_max: 2,
};
