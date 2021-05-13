import React from "react";

import { Details } from "./Details.js";

export default {
  title: "Dropdown/Details",
  component: Details,
};

const Template = (args) => <Details {...args} />;

const summary_content = <div>Summary</div>;
const content = <div>Content</div>;

export const Basic = Template.bind({});
Basic.args = {
  is_open: false,
  summary_content,
  persist_content: false,
  content,
};
