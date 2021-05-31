import { useArgs } from "@storybook/client-api";
import React from "react";

import { StatelessDetails } from "./Details";

import { Timer } from "./Timer";

export default {
  title: "Dropdown/Details",
  component: StatelessDetails,

  // Restricting the control of booleans
  argTypes: {
    persist_content: {
      control: "",
    },
    is_open: {
      control: "",
    },
  },

  // Need decorators to use useArgs()
  decorators: [(Story) => <div>{Story()}</div>],
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  const on_click = () => {
    updateArgs({ ...args, is_open: !args.is_open });
  };

  return (
    <>
      <StatelessDetails {...args} on_click={on_click} />
      <Timer persist_content={args.persist_content} is_open={args.is_open} />
    </>
  );
};

const summary_content = "Summary";

export const PersistContent = Template.bind({});
PersistContent.args = {
  is_open: false,
  summary_content,
  persist_content: true,
  content:
    "Persist Content: Children are hidden but present, so the timer runs even if this closes.",
};

export const NonPersistContent = Template.bind({});
NonPersistContent.args = {
  is_open: false,
  summary_content,
  persist_content: false,
  content:
    "Non-Persist Content: Children are unrendered, so the timer will stop when this closes.",
};
