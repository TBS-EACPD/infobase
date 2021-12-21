import _ from "lodash";

import { SubjectLike } from "src/models/subjects";

import { SafeJSURL } from "src/general_utils";

const infograph_href_template = (
  { subject_type, id }: SubjectLike,
  data_area: string | null = "intro",
  first_character: "#" | "&" = "#"
) =>
  `${first_character}infographic/${subject_type}/${id}${
    !_.isNull(data_area) ? `/${data_area}` : ""
  }`;

const infograph_options_href_template = (
  { subject_type, id }: SubjectLike,
  data_area: string,
  options: Record<string, string>,
  first_character: "#" | "&" = "#"
) =>
  `${first_character}infographic/${subject_type}/${id}/${data_area}/${
    !_.isEmpty(options) ? SafeJSURL.stringify(options) : ""
  }`;

export { infograph_href_template, infograph_options_href_template };
