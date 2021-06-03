import { useArgs } from "@storybook/client-api";
import React, { Fragment } from "react";

import { FixedPopover } from "./FixedPopover";

export default {
  title: "modals and popovers/FixedPopover",
  component: FixedPopover,

  // Need decorators to use useArgs()
  decorators: [(Story) => <div>{Story()}</div>],
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  function on_close_callback() {
    console.log(args.show ? "Closing " : "Opening " + " modal.");
    updateArgs({ ...args, show: !args.show });
  }
  return (
    <Fragment>
      <div id="ib-site-header-area" />
      <div style={{ height: "500vh" }}> Scroll down... </div>
      {args.show ? null : (
        <button onClick={on_close_callback}>Click to open modal</button>
      )}
      <div
        id="wb-info"
        style={{ height: "300px", borderTop: "2px black solid" }}
      />
      <FixedPopover {...args} on_close_callback={on_close_callback} />
    </Fragment>
  );
};

export const Basic = Template.bind({});
Basic.args = {
  show: true,

  // text
  title: "Title",
  body: "Body",
  header: "FixedPopover Header",
  subtitle: "Subtitle",
  footer: "Footer",

  // dimensions
  max_body_height: "3em",

  // css
  dialog_position: "",
  additional_dialog_position: "",
};

export const Timer = Template.bind({});
Timer.args = {
  show: true,

  // text
  title: "Title",
  body: "Hover over the modal before it goes away!",
  header: "FixedPopover Header",
  subtitle: "Subtitle",
  // footer: "Footer",
  close_text: "Close Text",

  // booleans
  restore_focus: true,
  close_button_in_header: false,

  // dimensions
  max_body_height: "3em",

  // css
  dialog_position: "",
  additional_dialog_position: "",

  // clock
  auto_close_time: 1000,
};
