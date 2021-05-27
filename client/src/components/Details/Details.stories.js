import React from "react";

import { CountdownCircle } from "src/components/CountdownCircle/CountdownCircle";

import { Details } from "./Details";

export default {
  title: "Dropdown/Details",
  component: Details,
};

// time: 10000,
// size: "20em",
// color: "blue",
// stroke_width: "1em",
// show_numbers: true,

const Template = (args) => {
  return (
    <div>
      <Details {...args} />
      <CountdownCircle {...args} />
    </div>
  );
};

const summary_content = <div>Summary</div>;
const content = <div>Content</div>;

export const PersistContent = Template.bind({});
PersistContent.args = {
  // Details
  is_open: false,
  summary_content,
  persist_content: true,
  content,

  // CountdownCircle
  time: 10000,
  size: "20em",
  color: "red",
  stroke_width: "1em",
  show_numbers: true,
  on_end_callback: "",
};

export const NonPersistContent = Template.bind({});
NonPersistContent.args = {
  is_open: false,
  summary_content,
  persist_content: false,
  content,

  // CountdownCircle
  time: 10000,
  size: "20em",
  color: "red",
  stroke_width: "1em",
  show_numbers: true,
  on_end_callback: "",
};
