import { trivial_text_maker } from "src/models/text.js";

import { HeaderNotification } from "../components/HeaderNotification.js";
import { get_session_storage_w_expiry } from "../general_utils.js";

export class RedirectHeader extends React.Component {
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
