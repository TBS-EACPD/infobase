import _ from "lodash";
import React from "react";

import { AlertBanner } from "./AlertBanner.tsx";

export default {
  title: "AlertBanner",
  component: AlertBanner,
};

const Template = (args) => <AlertBanner {...args} />;

const children = <div>Children</div>;

export const Basic = Template.bind({});
Basic.args = {
  // text
  children,

  // css
  banner_class: "banner_class",
  additional_banner_class: "additional_banner_class",
  style: "style",
};
