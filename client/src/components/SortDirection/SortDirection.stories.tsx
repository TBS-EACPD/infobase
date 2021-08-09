import { Story, Meta } from "@storybook/react";
import React, { useState } from "react";

import {
  primaryColor,
  secondaryColor,
} from "src/style_constants/common-variables.module.scss";

import { ComponentProps } from "src/types/util_types.d";

import { SortDirection } from "./SortDirection";

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
} as Meta;

type SortDirectionProps = ComponentProps<typeof SortDirection>;

const Template: Story<SortDirectionProps> = (_args) => {
  const [is_active1, set_active1] = useState(false);
  const [is_active2, set_active2] = useState(false);
  return (
    <div
      onClick={() => {
        set_active2(!is_active2);
        set_active1(is_active2);
      }}
    >
      <SortDirection sortDirection="ASC" active={is_active1} />
      <SortDirection sortDirection="DESC" active={is_active2} />
    </div>
  );
};

export const Basic = Template.bind({});
