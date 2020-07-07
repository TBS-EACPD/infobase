import { trivial_text_maker } from "../shared.js";
import { IconX, IconCheck } from "../../../icons/icons.js";

const digital_status_keys = [
  "account_reg_digital",
  "application_digital",
  "authentication",
  "decision_digital",
  "issuance_digital",
  "issue_res_digital",
];
const service_channels_keys = [
  "phone_inquiry",
  "online_inquiry",
  "online_application",
  "live_application",
  "mail_application",
  "other_application",
];
const get_available_icon = (value) =>
  value ? (
    <IconCheck
      title={trivial_text_maker("available")}
      color={window.infobase_color_constants.successDarkColor}
      width={30}
      alternate_color={false}
    />
  ) : (
    <IconX
      title={trivial_text_maker("not_available")}
      color={window.infobase_color_constants.highlightDark}
      width={30}
      alternate_color={false}
    />
  );

export { digital_status_keys, service_channels_keys, get_available_icon };
