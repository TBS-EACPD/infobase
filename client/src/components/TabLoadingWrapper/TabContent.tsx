import React from "react";

type TabContentProps = {
  args: React.ReactNode;
  data: React.ReactNode;
};

const TabContent = ({ args, data }: TabContentProps) => {
  return <div>{data}</div>;
};

export { TabContent };
