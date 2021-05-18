import _ from "lodash";
import React from "react";

import { WrappedNivoTreemap } from "./WrappedNivoTreemap";

export default {
  title: "charts/WrappedNivoTreemap",
  component: WrappedNivoTreemap,
};

const Template = (args) => <WrappedNivoTreemap {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  title: "WrappedNivoTreemap",
};
