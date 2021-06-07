import _ from "lodash";
import React from "react";

const TabContent = ({ args, data }) => {
  // {
  //   _.map(data, (text, key) => {
  //     <div key={key}>{text}</div>;
  //   });
  // }
  return <div>{data}</div>;
};

export { TabContent };
