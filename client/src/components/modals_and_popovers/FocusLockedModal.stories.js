import _ from "lodash";
import React, { Fragment } from "react";

import { FocusLockedModal } from "./FocusLockedModal";

export default {
  title: "modals and popovers/FocusLockedModal",
  component: FocusLockedModal,
};

const Template = (args) => {
  return (
    <Fragment>
      <div id="ib-site-header-area" />
      <div style={{ height: "500vh" }}> Switch mounted control to focus </div>
      <div
        id="wb-info"
        style={{ height: "300px", borderTop: "2px black solid" }}
      />
      <FocusLockedModal {...args} />
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

  // functions
  // on_exit

  // css
  additional_dialogue_class: "",
};
