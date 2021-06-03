import { useArgs } from "@storybook/client-api";
import React, { Fragment } from "react";

import { FocusLockedModal } from "./FocusLockedModal";

export default {
  title: "modals and popovers/FocusLockedModal",
  component: FocusLockedModal,

  // Need decorators to use useArgs()
  decorators: [(Story) => <div>{Story()}</div>],
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();
  function on_exit() {
    console.log(args.mounted ? "Closing Modal" : "Opening Modal");
    updateArgs({ ...args, mounted: !args.mounted });
  }

  return (
    <Fragment>
      <div id="ib-site-header-area" />
      <div style={{ height: "500vh" }}> Switch mounted control to focus </div>
      {args.mounted ? null : (
        <button onClick={on_exit}>Click to open modal</button>
      )}
      <div
        id="wb-info"
        style={{ height: "300px", borderTop: "2px black solid" }}
      />
      <FocusLockedModal {...args} on_exit={on_exit} />
    </Fragment>
  );
};

const aria_label = {
  en: "English",
  fr: "Francais",
};

export const Basic = Template.bind({});
Basic.args = {
  // text
  children: "Focused Modal",
  aria_label,

  // booleans
  mounted: false,

  // css
  additional_dialogue_class: "",
};
