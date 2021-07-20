import { Story, Meta } from "@storybook/react";
import _ from "lodash";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { AutoAccordion } from "./Accordions";

export default {
  title: "Accordion",
  component: AutoAccordion,
} as Meta;

type AutoAccordionProps = ComponentProps<typeof AutoAccordion>;

const Template: Story<AutoAccordionProps> = (args) => (
  <AutoAccordion {...args} />
);

const sentences = _.map(_.range(10), (num) => (
  <div key={num}>{`Sentence ${num}`}</div>
));

const children = <div>{sentences}</div>;

export const Basic = Template.bind({});
Basic.args = {
  children,
  title: "AutoAccordion",
};
