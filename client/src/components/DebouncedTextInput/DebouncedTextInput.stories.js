import React from "react";

import { DebouncedTextInput } from "./DebouncedTextInput.js";

export default {
  title: "Input/DebouncedTextInput",
  component: DebouncedTextInput,
};

const Template = (args) => <DebouncedTextInput {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  placeHolder: "Write something",
};
