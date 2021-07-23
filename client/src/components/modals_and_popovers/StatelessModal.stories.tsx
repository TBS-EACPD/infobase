import { useArgs } from "@storybook/client-api";
import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { StatelessModal } from "./StatelessModal";

export default {
  title: "modals and popovers/StatlelessModal",
  component: StatelessModal,

  // Need decorators to use useArgs()
  decorators: [(Story) => <div>{Story()}</div>],
} as Meta;

type StatelessModalProps = ComponentProps<typeof StatelessModal>;

const Template: Story<StatelessModalProps> = (args) => {
  const [_, updateArgs] = useArgs();

  function on_close_callback() {
    console.log(args.show ? "Closing Modal" : "Opening Modal");
    updateArgs({ ...args, show: !args.show });
  }
  return (
    <div>
      <StatelessModal {...args} on_close_callback={on_close_callback} />
      {!args.show ? (
        <button onClick={on_close_callback}>Click to open modal</button>
      ) : null}
    </div>
  );
};

const body =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export const Basic = Template.bind({});
Basic.args = {
  show: true,
  title: "Title",
  subtitle: "Subtitle",
  body,
  close_text: "Close",
  include_close_button_in_header: false,
  additional_dialog_class_name: "",
};

export const HeaderOptions = Template.bind({});
HeaderOptions.args = {
  show: true,
  header: "Header",
  footer: "Footer",
  body,
  additional_dialog_class_name: "",
};
