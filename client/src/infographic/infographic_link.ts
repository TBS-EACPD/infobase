import _ from "lodash";

import { SubjectLike } from "src/models/subjects";

import { SafeJSURL } from "src/general_utils";

export const infograph_href_template = (
  { subject_type, id }: SubjectLike,
  data_area = "intro",
  options: Record<string, string> = {},
  first_character: "#" | "/" = "#"
) =>
  `${first_character}infographic/${subject_type}/${id}${
    !_.isNull(data_area) ? `/${data_area}` : ""
  }}${!_.isEmpty(options) ? `/${SafeJSURL.stringify(options)}` : ""}`;
