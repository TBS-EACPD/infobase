import React from "react";

import { HeightClipper } from "../components/HeightClipper.js";

export default {
  title: "HeightClipper",
  component: HeightClipper,
};

const Template = (args) => (
  <HeightClipper clipHeight={200} {...args}>
    <div style={{ height: "300px", backgroundColor: "black" }}>
      some content
    </div>
  </HeightClipper>
);

export const Reclippable = Template.bind({});
Reclippable.args = {
  allowReclip: true,
};
