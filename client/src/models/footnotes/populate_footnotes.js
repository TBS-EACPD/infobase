import d3 from "src/app_bootstrap/d3-bundle.js";
import { lang } from "src/app_bootstrap/globals.js";
import _ from "lodash";

import { sanitized_marked } from "../../general_utils.js";
import { get_static_url, make_request } from "../../request_utils.js";
import { Subject } from "../subject.js";
import { run_template } from "../text.js";
import { fiscal_year_to_year } from "../years.js";

import { get_dynamic_footnotes } from "./dynamic_footnotes.js";
import FootNote from "./footnotes.js";

import footnote_topic_text from "./footnote_topics.yaml";

const footnote_topic_keys = _.keys(footnote_topic_text);

let _loaded_dept_or_tag_codes = {};

function populate_footnotes_info(csv_str) {
  const rows = _.map(d3.csvParse(_.trim(csv_str)), (row) =>
    _.mapValues(row, (item) => _.trim(item))
  );

  _.each(rows, (obj) => {
    const {
      id,
      subject_class,
      subject_id,
      fyear1,
      fyear2,
      topic_keys,
      footnote,
    } = obj;

    const split_topic_keys = topic_keys
      .split(",")
      .map((key) => key.replace(" ", ""));

    const invalid_keys = _.difference(split_topic_keys, footnote_topic_keys);
    if (invalid_keys.length > 0) {
      throw new Error(
        `Footnote ${id} has invalid topic key(s): ${_.join(
          invalid_keys,
          ", "
        )}. To register a new topic key, add it to client/src/models/footnotes/footnote_topics.yaml`
      );
    }

    const year1 = fiscal_year_to_year(fyear1);
    const year2 = fiscal_year_to_year(fyear2);

    const text = sanitized_marked(run_template(footnote));

    if (subject_id !== "*") {
      const subject = Subject[subject_class].lookup(subject_id);

      FootNote.create_and_register({
        id: obj.id,
        subject,
        year1,
        year2,
        topic_keys: split_topic_keys,
        text,
      });
    } else {
      const actual_subject_class = Subject[subject_class];

      FootNote.create_and_register({
        id,
        subject: actual_subject_class,
        year1,
        year2,
        topic_keys: split_topic_keys,
        text,
      });
    }
  });
}

function load_footnotes_bundle(subject) {
  let subject_code;
  if (subject) {
    switch (subject.level) {
      case "gov":
        return Promise.resolve();
      case "dept":
        subject_code = subject.dept_code;
        break;
      case "program":
        subject_code = subject.dept.dept_code;
        break;
      case "crso":
        subject_code = subject.dept.dept_code;
        break;
      case "tag":
        subject_code = subject.id;
        break;
      default:
        subject_code = "all";
        break;
    }
  } else {
    if (subject === "estimates") {
      subject_code = "estimates";
    } else {
      subject_code = "all";
    }
  }

  if (
    _loaded_dept_or_tag_codes[subject_code] ||
    _loaded_dept_or_tag_codes["all"]
  ) {
    return Promise.resolve();
  }

  // reminder: the funky .json.js exstension is to ensure that Cloudflare caches these, as it usually won't cache .json
  return make_request(
    get_static_url(`footnotes/fn_${lang}_${subject_code}.json.js`)
  ).then((csv_str) => {
    populate_footnotes_info(csv_str);
    _loaded_dept_or_tag_codes[subject_code] = true;
  });
}

//this is exposed so populate stores can take the 'global' class-level footnotes that will be used by every infograph.
function populate_global_footnotes(csv_str) {
  populate_footnotes_info(csv_str);

  _.each(get_dynamic_footnotes(), function (footnote_config) {
    FootNote.create_and_register(footnote_config);
  });
}

export { load_footnotes_bundle, populate_global_footnotes };
