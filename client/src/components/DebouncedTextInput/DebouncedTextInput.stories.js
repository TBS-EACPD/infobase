import React, { useState } from "react";

import { DebouncedTextInput } from "./DebouncedTextInput";

export default {
  title: "Input/DebouncedTextInput",
  component: DebouncedTextInput,
};

const Template = (args) => {
  const [text, setText] = useState("");

  function updateCallback(value) {
    setText(value);
    console.log("Text has been changed to " + value);
  }

  return (
    <>
      <DebouncedTextInput {...args} updateCallback={updateCallback} />
      <div>{text}</div>
    </>
  );
};

export const Basic = Template.bind({});
Basic.args = {
  a11y_label: "Label",
  placeHolder: "Write something",
  defaultValue: "",
  debounceTime: 2000,
  inputClassName: "",
};
