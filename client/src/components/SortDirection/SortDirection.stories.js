import React, { useState } from "react";

import { primaryColor, secondaryColor } from "src/core/color_defs.js";

import { SortDirection } from "./SortDirection.js";

export default {
  title: "SortDirection",
  component: SortDirection,
  parameters: {
    backgrounds: {
      default: "navy blue",
      values: [
        { name: "navy blue", value: primaryColor },
        { name: "blue", value: secondaryColor },
      ],
    },
  },
};

const Template = (args) => {
  const [is_active1, set_active1] = useState(false);
  const [is_active2, set_active2] = useState(false);
  return (
    <div
      onClick={() => {
        set_active2(!is_active2);
        set_active1(is_active2);
      }}
    >
      <SortDirection sortDirection="ASC" active={is_active1} {...args} />
      <SortDirection sortDirection="DESC" active={is_active2} {...args} />
    </div>
  );
};

export const Basic = Template.bind({});
Basic.args = {};
