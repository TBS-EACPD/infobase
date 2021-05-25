import _ from "lodash";
import React from "react";

import { trivial_text_maker } from "src/models/text";

import { get_session_storage_w_expiry } from "src/general_utils";

import { HeaderNotification } from "./HeaderNotification";

export default {
  title: "HeaderNotification",
  component: HeaderNotification,
};

const Template = (args) => <HeaderNotification {...args} />;

const url_before_redirect_key = "pre_redirected_url";
const redirect_msg_key = "redirected_msg";

export const Basic = Template.bind({});
Basic.args = {
  list_of_text: [
    trivial_text_maker("common_redirect_msg", {
      url: get_session_storage_w_expiry(url_before_redirect_key),
    }),
    get_session_storage_w_expiry(redirect_msg_key),
  ],
  hideNotification: () => {
    sessionStorage.removeItem(url_before_redirect_key);
    sessionStorage.removeItem(redirect_msg_key);
    this.setState({ show_redirected_msg: false });
  },
};
