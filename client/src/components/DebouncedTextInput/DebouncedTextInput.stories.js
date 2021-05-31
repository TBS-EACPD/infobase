import React, { useState } from "react";

import { DebouncedTextInput } from "./DebouncedTextInput";

export default {
  title: "Input/DebouncedTextInput",
  component: DebouncedTextInput,
};

const Template = (args) => {
  function updateCallback(value) {
    console.log("HI");
  }

  return <DebouncedTextInput {...args} {...updateCallback} />;
};

export const Basic = Template.bind({});
Basic.args = {
  a11y_label: "Label",
  placeHolder: "Write something",
  defaultValue: "",
  debounceTime: 10000,
  inputClassName: "",
};
