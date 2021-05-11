import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { RadioButtons } from "./RadioButtons.tsx";

export default {
  title: "RadioButton",
  component: RadioButtons,
};

const Template = (args) => <RadioButtons {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  // options: {[
  //   {
  //     display: "Option 1",
  //     id: "1",
  //     active: true,
  //   },
  //   {
  //     display: "Option 2",
  //     id: "2",
  //     active: true,
  //   },
  // ]},
  options: {},
  // display: "",
  // id: "",
  // active: true,
};
