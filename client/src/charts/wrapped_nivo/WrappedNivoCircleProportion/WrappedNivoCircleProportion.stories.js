import _ from "lodash";
import React from "react";

import { WrappedNivoCircleProportion } from "./WrappedNivoCircleProportion";

export default {
  title: "charts/WrappedNivoCircleProportion",
  component: WrappedNivoCircleProportion,
};

const Template = (args) => <WrappedNivoCircleProportion {...args} />;

export const Basic = Template.bind({});
Basic.args = {};
