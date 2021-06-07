import _ from "lodash";
import React from "react";

import { TabbedContent } from "./TabbedContent";
import { TabLoadingWrapper } from "./TabLoadingWrapper";

export default {
  title: "TabLoadingWrapper",
  component: TabLoadingWrapper,
  argTypes: {},
};

const Template = (args) => {
  // function load_data(data) {
  //   return data ? data : "Null";
  // }

  const promise = new Promise((resolve, reject) => {
    const data = "Some data";
    resolve(data);
  });

  return (
    <TabLoadingWrapper
      {...args}
      load_data={promise}
      TabbedContent={<TabbedContent {...args} data={promise} />}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {};
