import _ from "lodash";
import React from "react";

import { Panel } from "./Panel.js";

export default {
  title: "Panel",
  component: Panel,
};

const Template = (args) => <Panel {...args} />;

const children = <div>Children</div>;

export const Basic = Template.bind({});
Basic.args = {
  allowOverflow: true,
  title: "title",
  otherHeaderContent: "",
  children,
  sources: "",
  id: 1,
  glossary_keys: {},
  footnotes: [],
  isOpen: true,
  style: {},
};
