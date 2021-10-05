import { Story, Meta } from "@storybook/react";
import React, { useState } from "react";

import { primaryColor, secondaryColor } from "src/style_constants/index";

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
  function onClick(sortDirection: boolean) {
    set_active2(sortDirection);
    set_active1(!sortDirection);
  }
  return (
    <div>
      <SortDirection
        sortDirection="ASC"
        active={is_active1}
        onDirectionClick={(dir) => onClick(dir)}
      />
      <SortDirection
        sortDirection="DESC"
        active={is_active2}
        onDirectionClick={(dir) => onClick(dir)}
      />
    </div>
  );
};

export const Basic = Template.bind({});
