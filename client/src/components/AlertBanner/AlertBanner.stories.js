import _ from "lodash";
import React from "react";

import { AlertBanner } from "./AlertBanner.js";

export default {
  title: "AlertBanner",
  component: AlertBanner,
};

const Template = (args) => <AlertBanner {...args} />;

const children = <div>Children</div>;

export const Basic = Template.bind({});
Basic.args = {
  children,
  banner_class: "info",
};
