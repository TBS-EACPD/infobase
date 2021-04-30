import _ from "lodash";
import React from "react";

import { AutoAccordion } from "./Accordions.js";

export default {
  title: "Accordion",
  component: AutoAccordion,
};

const Template = (args) => <AutoAccordion {...args} />;

const sentences = _.map(_.range(10), (num) => (
  <div key={num}>{`Sentence ${num}`}</div>
));

const children = <div>{sentences}</div>;

export const Basic = Template.bind({});
Basic.args = {
  children,
  title: "AutoAccordion",
};
