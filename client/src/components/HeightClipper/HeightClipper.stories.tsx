import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { HeightClipper } from "./HeightClipper";

export default {
  title: "HeightClipper",
  component: HeightClipper,
} as Meta;

type HeightClipperProps = ComponentProps<typeof HeightClipper>;

const Template: Story<HeightClipperProps> = (args) => (
  <HeightClipper {...args}>
    <div style={{ height: "300px", backgroundColor: "black", color: "white" }}>
      some content
    </div>
  </HeightClipper>
);

export const Reclippable = Template.bind({});
Reclippable.args = {
  allowReclip: true,
  clipHeight: 200,
};
