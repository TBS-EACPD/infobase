import React from "react";

import { primaryColor, secondaryColor } from "src/core/color_defs.js";

import { SpinnerWrapper } from "./SpinnerWrapper.js";

export default {
  title: "SpinnerWrapper",
  component: SpinnerWrapper,
};

const Template = (args) => <SpinnerWrapper {...args} />;

export const SmallInline = Template.bind({});
export const BasicLeaf = Template.bind({});
export const NonLeafSpinner = Template.bind({});

SmallInline.args = {
  config_name: "small_inline",
  scale: 1,
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
          style={{ position: "absolute", left: "2em", padding: "2em 0em" }}
        >
          <Story />
        </div>
      </div>
    );
  },
];

BasicLeaf.args = {
  // config_name: "tabbed_content",
  scale: 10,
  use_leaf_spinner: true,
};

NonLeafSpinner.args = {
  scale: 1,
  use_leaf_spinner: false,
};
