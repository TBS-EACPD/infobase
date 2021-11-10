import React from "react";

import { TabContent } from "./TabContent";
import { TabLoadingWrapper } from "./TabLoadingWrapper";

export default {
  title: "TabLoadingWrapper",
  component: TabLoadingWrapper,
};

const Template = (args: React.ReactNode) => {
  const promise = (arg: React.ReactNode) =>
    new Promise((resolve, reject) => {
      const data = "This is the TabLoadingWrapper component.";
      setTimeout(() => resolve(data), 5000);
    });

  return (
    <div>
      <TabLoadingWrapper
        args={args}
        load_data={
          promise as (arg: React.ReactNode) => Promise<React.ReactNode>
        }
        TabContent={TabContent}
      />
      <button
        onClick={() => {
          window.location.reload();
          console.log("Page refreshed");
        }}
      >
        Click to Refresh
      </button>
    </div>
  );
};

export const Basic = Template.bind({});
