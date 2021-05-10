import _ from "lodash";
import React from "react";

import { FocusLockedModal } from "./FocusLockedModal.js";

export default {
  title: "FocusLockedModal",
  component: FocusLockedModal,
};

const Template = (args) => <FocusLockedModal {...args} />;

const children = <div>Children</div>;
const aria_label = {
  en: "English",
  fr: "Francais",
};

export const Basic = Template.bind({});
Basic.args = {
  // text
  children,
  aria_label,

  // booleans
  mounted: true,
  on_exit: true,

  // css
  additional_dialogue_class: "additional_dialogue_class",
};
