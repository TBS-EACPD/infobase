import _ from "lodash";

import { SafeJSURL } from "src/general_utils";

const infograph_href_template = (
  { subject_type, id },
  data_area,
  first_character = "#"
) =>
  `${first_character}infographic/${subject_type}/${id}/${
    data_area ? data_area : "intro"
  }`;

const infograph_options_href_template = (
  subj,
  data_area,
  options,
  first_character = "#"
) =>
  `${first_character}infographic/${subj.subject_type}/${subj.id}/${
    data_area ? data_area : ""
  }/${!_.isEmpty(options) ? SafeJSURL.stringify(options) : ""}`;

export { infograph_href_template, infograph_options_href_template };
