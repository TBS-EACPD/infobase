import _ from "lodash";

import { SafeJSURL } from "src/general_utils.js";

const infograph_href_template = (subj, data_area, first_character = "#") =>
  `${first_character}orgs/${subj.level}/${subj.id}/infograph/${
    data_area ? data_area : "intro"
  }`;

const infograph_options_href_template = (
  subj,
  data_area,
  options,
  first_character = "#"
) =>
  `${first_character}orgs/${subj.level}/${subj.id}/infograph/${
    data_area ? data_area : ""
  }/${!_.isEmpty(options) ? SafeJSURL.stringify(options) : ""}`;

export { infograph_href_template, infograph_options_href_template };
