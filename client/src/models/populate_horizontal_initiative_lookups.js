import _ from "lodash";

import d3 from "src/core/d3-bundle.js";
import { lang } from "src/core/injected_build_constants.js";


import { get_static_url, make_request } from "../request_utils.js";

import { Subject } from "./subject.js";

const { Tag } = Subject;

const parse_csv_string = (csv_string) =>
  _.tail(d3.csvParseRows(_.trim(csv_string)));

const load_csv = (csv_name) =>
  make_request(get_static_url(`csv/${csv_name}.csv`)).then((csv_string) =>
    parse_csv_string(csv_string)
  );

function extend_hi_tags(hi_lookups) {
  const processed_hi_lookups = _.chain(hi_lookups)
    .map(([hi_id, ...lookups]) => [
      hi_id,
      _.chain([
        "lead_dept",
        "start_year",
        "end_year",
        "total_allocated_amount",
        "website_url",
        "dr_url",
      ])
        .zip(lookups)
        .fromPairs()
        .value(),
    ])
    .fromPairs()
    .value();

  _.each(Tag.tag_roots.HI.children_tags, ({ id }) =>
    Tag.extend(id, {
      lookups: {
        ...(processed_hi_lookups[id] || {}),
      },
    })
  );
}

export const load_horizontal_initiative_lookups = () =>
  load_csv(`hi_lookups_${lang}`).then((hi_lookups) =>
    extend_hi_tags(hi_lookups)
  );
