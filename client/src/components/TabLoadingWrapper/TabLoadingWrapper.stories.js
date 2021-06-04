import React from "react";

import { TabLoadingWrapper } from "./TabLoadingWrapper";

export default {
  title: "TabLoadingWrapper",
  component: TabLoadingWrapper,
  argTypes: {},
};

const Template = (props) => {
  function load_data(data) {
    return data;
  }

  return <TabLoadingWrapper {...props} load_data={load_data} />;
};

export const Basic = Template.bind({});
Basic.args = {
  args: {},
};
