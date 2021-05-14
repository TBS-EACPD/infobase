import React from "react";

// eslint-disable-next-line no-restricted-imports
import {
  primaryColor,
  secondaryColor,
  tertiaryColor,
} from "src/core/color_defs.js";

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
        { name: "grey", value: tertiaryColor },
      ],
    },
  },
};

const Template = (args) => <SortDirection {...args} />;

export const Ascending = Template.bind({});
export const Descending = Template.bind({});
Ascending.args = {
  active: true,
  sortDirection: "ASC",
};
Descending.args = {
  active: true,
  sortDirection: "DESC",
};
