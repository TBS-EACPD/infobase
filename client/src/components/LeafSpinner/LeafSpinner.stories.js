import React from "react";

import { primaryColor, secondaryColor } from "src/core/color_defs";

import { LeafSpinner } from "./LeafSpinner";

export default {
  title: "LeafSpinner",
  component: LeafSpinner,
};

const Template = (args) => <LeafSpinner {...args} />;
export const Initial = Template.bind({});
export const Route = Template.bind({});
export const SubRoute = Template.bind({});
export const SmallInline = Template.bind({});
export const TabbedContent = Template.bind({});

Initial.args = {
  config_name: "initial",
};

Route.args = {
  config_name: "route",
};

SubRoute.args = {
  config_name: "sub_route",
};

SmallInline.args = {
  config_name: "small_inline",
};
SmallInline.parameters = {
  backgrounds: {
    default: "navy blue",
    values: [
      { name: "navy blue", value: primaryColor },
      { name: "blue", value: secondaryColor },
    ],
  },
};
SmallInline.decorators = [
  (Story) => {
    return (
      <div className="outer-container" style={{ position: "relative" }}>
        <div
          className="inner-container"
          style={{ position: "absolute", left: "2em", top: "2em" }}
        >
          <Story />
        </div>
      </div>
    );
  },
];

TabbedContent.args = {
  config_name: "tabbed_content",
};
