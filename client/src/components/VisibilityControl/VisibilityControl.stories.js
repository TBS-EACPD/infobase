import { useArgs } from "@storybook/client-api";
import _ from "lodash";
import React from "react";

import { VisibilityControl } from "./VisibilityControl";

export default {
  title: "Input/VisibilityControl",
  component: VisibilityControl,

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
  return <VisibilityControl {...args} click_callback={click_callback} />;
};

const svg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    className="icon-svg"
    viewBox="0 0 500 500"
    aria-hidden="false"
    style={{ width: "41px", height: "41px", verticalAlign: "0em" }}
  >
    <g style={{ fill: "rgb(32, 107, 189)", stroke: "rgb(32, 107, 189)" }}>
      <path d="M250,68.2c100.4,0,181.7,81.4,181.7,181.8s-81.4,181.7-181.8,181.7S68.2,350.4,68.2,250 c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8 S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"></path>
      <path d="M234.9,354.7l127.9-186.2c3.7-5.5,3-13.1-1.6-17.1L347,139.2c-1.7-1.5-3.9-2.3-6.1-2.3l0,0 c-3.7,0.1-7.1,2-9.1,5.1L218.5,307l-57.7-48.5c-1.9-1.7-4.2-2.6-6.7-2.8l0,0c-1.8-0.1-3.5,0.8-4.6,2.2l-13.9,20.7 c-2.1,3.2-0.5,8.6,3.6,12l80.9,68.1c1.9,1.7,4.2,2.6,6.7,2.8c1.8,0.1,3.5-0.8,4.6-2.2"></path>
    </g>
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
