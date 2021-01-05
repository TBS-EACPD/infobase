import { trivial_text_maker } from "src/models/text.js";

import { HeaderNotification } from "../components/HeaderNotification.js";

import {
  get_session_storage_w_expiry,
  set_session_storage_w_expiry,
} from "../general_utils.js";

import { log_standard_event } from "./analytics.js";

const redirect_with_msg = (
  msg,
  replaced_route,
  redirect_msg_key = "redirected_msg",
  url_before_redirect_key = "pre_redirected_url"
) => {
  log_standard_event({
    SUBAPP: window.location.hash.replace("#", ""),
    MISC1: "REDIRECTED_MSG",
    MISC2: window.location.href,
  });

  set_session_storage_w_expiry(url_before_redirect_key, location.href);
  set_session_storage_w_expiry(redirect_msg_key, msg);
  window.location.replace(replaced_route);
  window.location.reload();
  return null;
};

class RedirectHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show_redirected_msg: get_session_storage_w_expiry(props.redirect_msg_key),
    };
  }

  render() {
    const { redirect_msg_key, url_before_redirect_key } = this.props;
    return (
      this.state.show_redirected_msg && (
        <HeaderNotification
          list_of_text={[
            trivial_text_maker("common_redirect_msg", {
              url: get_session_storage_w_expiry(url_before_redirect_key),
            }),
            get_session_storage_w_expiry(redirect_msg_key),
          ]}
          hideNotification={() => {
            sessionStorage.removeItem(url_before_redirect_key);
            sessionStorage.removeItem(redirect_msg_key);
            this.setState({ show_redirected_msg: false });
          }}
        />
      )
    );
  }
}
export { RedirectHeader, redirect_with_msg };
