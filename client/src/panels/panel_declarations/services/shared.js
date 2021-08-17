import React from "react";

import { trivial_text_maker } from "src/models/text";

import { IconX, IconCheck, IconNotApplicable } from "src/icons/icons";
import {
  successDarkColor,
  highlightDarkColor,
  warnDarkColor,
} from "src/style_constants/index";

const digital_status_keys = [
  "account_reg_digital",
  "authentication",
  "application_digital",
  "decision_digital",
  "issuance_digital",
  "issue_res_digital",
];
const application_channels_keys = [
  "other_application_count",
  "live_application_count",
  "mail_application_count",
  "online_application_count",
];
const application_channels_query_fragment = `
service_report {
  year
  online_inquiry_count
  online_application_count
  live_application_count
  mail_application_count
  other_application_count
}
`;
const available_keys = {
  true: "yes",
  false: "no",
  null: "not_applicable",
};
const available_icons = {
  yes: (
    <IconCheck
      title={trivial_text_maker("yes")}
      color={successDarkColor}
      width={30}
      alternate_color={false}
    />
  ),
  no: (
    <IconX
      title={trivial_text_maker("no")}
      color={highlightDarkColor}
      width={30}
      alternate_color={false}
    />
  ),
  not_applicable: (
    <IconNotApplicable
      title={trivial_text_maker("not_applicable")}
      color={warnDarkColor}
      width={30}
      alternate_color={false}
    />
  ),
};

export {
  digital_status_keys,
  application_channels_keys,
  application_channels_query_fragment,
  available_keys,
  available_icons,
};
