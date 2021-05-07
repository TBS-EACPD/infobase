import _ from "lodash";
import React from "react";

import { FocusLockedModal } from "./FocusLockedModal.js";

export default {
  title: "FocusLockedModal",
  component: FocusLockedModal,
};

const Template = (args) => (
  <FocusLockedModal {...args} />
);

const children = <div>Hi</div>

export const Basic = Template.bind({});
Basic.args = {
    children,
    mounted: true,
    on_exit: true,
};