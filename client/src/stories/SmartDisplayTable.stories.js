import React from "react";

import { SmartDisplayTable } from "../components/DisplayTable";

export default {
  title: "Tables/SmartDisplayTable",
  component: SmartDisplayTable,
};

const Template = (args) => {
  const data = [
    { label: "Pepperoni", price: 12 },
    { label: "Pepperoni", price: 9 },
  ];
  const column_configs = {
    label: {
      index: 0,
      header: "Pizza type",
      is_searchable: true,
    },
    price: {
      index: 1,
      header: "Price",
    },
  };
  console.log(data);
  console.log(column_configs);
  return (
    <SmartDisplayTable data={data} column_configs={column_configs} {...args} />
  );
};

export const Basic = Template.bind({});
Basic.args = { unsorted_initial: true };
