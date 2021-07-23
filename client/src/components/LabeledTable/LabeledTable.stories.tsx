import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { LabeledTable } from "./LabeledTable";

export default {
  title: "LabeledTable",
  component: LabeledTable,
  argTypes: {
    contents: {
      // When the values are put as controls and changed, storybook crashes for some reason, so the control for this is removed for now
      defaultValue: [
        { id: "1", label: "Label 1", content: <div>Children</div> },
        { id: "2", label: "Label 2", content: <div>Children</div> },
      ],
    },
  },
} as Meta;

type LabeledTableProps = ComponentProps<typeof LabeledTable>;

const Template: Story<LabeledTableProps> = (args) => <LabeledTable {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  title: "Title",
};
