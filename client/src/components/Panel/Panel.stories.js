import React from "react";

import { Panel } from "./Panel";

export default {
  title: "subroute",
  component: Panel,
};

// TODO Implement the props in more completeness
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
