import { SafeJSURL } from "../general_utils.js";

const infograph_href_template = (subj, data_area, first_character = "#") =>
  `${first_character}orgs/${subj.level}/${subj.id}/infograph/${
    data_area ? data_area : "intro"
  }`;

const panel_href_template = (
  subj,
  data_area,
  panel_key,
  first_character = "#"
) =>
  `${first_character}orgs/${subj.level}/${subj.id}/infograph/${
    data_area ? data_area : ""
  }/${panel_key ? SafeJSURL.stringify({ panel_key: panel_key }) : ""}`;

const infograph_options_href_template = (
  subj,
  data_area,
  options,
  first_character = "#"
) =>
  `${first_character}orgs/${subj.level}/${subj.id}/infograph/${
    data_area ? data_area : ""
  }/${!_.isEmpty(options) ? SafeJSURL.stringify(options) : ""}`;

export {
  infograph_href_template,
  panel_href_template,
  infograph_options_href_template,
};
