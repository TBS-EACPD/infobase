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
  "in_person_applications",
  "mail_applications",
  "online_applications",
  "other_channel_applications",
  "telephone_enquires",
  "website_visits",
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
