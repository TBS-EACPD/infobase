import _ from "lodash";
import React from "react";

import { WrappedNivoLine } from "./WrappedNivoLine";

export default {
  title: "charts/WrappedNivoLine",
  component: WrappedNivoLine,
};

const Template = (args) => <WrappedNivoLine {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  title: "WrappedNivoLine",
};
