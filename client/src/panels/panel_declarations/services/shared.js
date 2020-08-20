import { trivial_text_maker } from "../shared.js";
import { IconX, IconCheck, IconNotApplicable } from "../../../icons/icons.js";

const digital_status_keys = [
  "account_reg_digital",
  "authentication",
  "application_digital",
  "decision_digital",
  "issuance_digital",
  "issue_res_digital",
];
const delivery_channels_keys = [
  "phone_inquiry",
  "online_inquiry",
  "other_application",
  "live_application",
  "mail_application",
  "online_application",
];
const application_channels_keys = [
  "phone_inquiry",
  "other_application",
  "live_application",
  "mail_application",
  "online_application",
];
const available_keys = {
  true: "yes",
  false: "no",
  null: "not_applicable",
};
const available_icons = {
  yes: (
    <IconCheck
      title={trivial_text_maker("yes")}
      color={window.infobase_color_constants.successDarkColor}
      width={30}
      alternate_color={false}
    />
  ),
  no: (
    <IconX
      title={trivial_text_maker("no")}
      color={window.infobase_color_constants.highlightDark}
      width={30}
      alternate_color={false}
    />
  ),
  not_applicable: (
    <IconNotApplicable
      title={trivial_text_maker("not_applicable")}
      color={window.infobase_color_constants.warnDarkColor}
      width={30}
      alternate_color={false}
    />
  ),
};

export {
  digital_status_keys,
  delivery_channels_keys,
  application_channels_keys,
  available_keys,
  available_icons,
};
