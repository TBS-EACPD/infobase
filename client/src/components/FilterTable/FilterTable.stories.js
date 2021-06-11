import { useArgs } from "@storybook/client-api";
import _ from "lodash";
import React from "react";

import { FilterTable } from "./FilterTable";

export default {
  title: "Input/FilterTable",
  component: FilterTable,

  // Need decorators to use useArgs()
  decorators: [(Story) => <div>{Story()}</div>],
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  function click_callback(key) {
    const updateItems = args.items;
    updateItems[parseInt(key)]["count"] =
      updateItems[parseInt(key)]["count"] + 1;

    console.log(
      updateItems[parseInt(key)]["text"] +
        " has been clicked " +
        updateItems[parseInt(key)]["count"] +
        " time(s) now."
    );

    updateArgs({ ...args, items: updateItems });
  }
  return <FilterTable {...args} click_callback={click_callback} />;
};

const svg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-700 50 2000 2000">
    <path
      d="M300,69a230.14,230.14,0,1,1-89.91,18.14A229.56,229.56,0,0,1,300,69m0-23C159.72,46,46,159.72,46,300S159.72,554,300,554,554,440.28,554,300,440.28,46,300,46Z"
      fill="#2C70C9"
    />
    <path
      d="M365.88,417c-22.95,46.35-53.92,69.46-72.39,73.14-17.38,3.47-26.16-12.29-24.29-53.88,1.89-50.06,3.43-82,4.65-126.85.34-18.13-.85-24.11-7.36-22.81-7.61,1.52-18.59,14.43-26.31,26.7l-6.4-6.63c19.14-34.3,53.7-67.73,74.34-71.84,19-3.79,23,13.48,22.11,62.78-1.44,40.95-2.88,81.89-4.43,122.29-.77,16,2.92,20.31,7.8,19.34,3.81-.76,13.15-7.71,26-28.33ZM323.93,144.16c3.68,18.47-4.81,38.23-23.27,41.91-15.21,3-27-5.34-30.5-22.72-3.14-15.75,3.82-37.47,25-41.69C310.91,118.52,321.11,130,323.93,144.16Z"
      fill="#2C70C9"
    />
  </svg>
);

const items = [
  {
    active: true,
    count: 0,
    text: "Option 1",
    aria_text: "",
    icon: svg,
    key: "0",
  },
  {
    active: true,
    count: 0,
    text: "Option 2",
    aria_text: "",
    icon: svg,
    key: "1",
  },
  {
    active: true,
    count: 0,
    text: "Option 3",
    aria_text: "",
    icon: svg,
    key: "2",
  },
  {
    active: true,
    count: 0,
    text: "Option 4",
    aria_text: "",
    icon: svg,
    key: "3",
  },
];

export const Basic = Template.bind({});
Basic.args = {
  items,
  item_component_order: ["count", "icon", "text"],
  show_eyes_override: true,
};
