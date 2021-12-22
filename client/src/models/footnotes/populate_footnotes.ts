import { csvParse } from "d3-dsv";
import _ from "lodash";

import type { SubjectClassInstance } from "src/models/subjects";
import {
  Dept,
  CRSO,
  Program,
  class_subject_types,
  is_class_subject_types,
} from "src/models/subjects";
import { run_template } from "src/models/text";
import { fiscal_year_to_year } from "src/models/years";

import { lang } from "src/core/injected_build_constants";

import { sanitized_marked } from "src/general_utils";

import { get_static_url, make_request } from "src/request_utils";

import { get_dynamic_footnote_definitions } from "./dynamic_footnotes";
import { footNoteStore } from "./footnotes";

import footnote_topic_text from "./footnote_topics.yaml";

const footnote_topic_keys = _.keys(footnote_topic_text);

function populate_footnotes(csv_str: string) {
  const rows = _.map(csvParse(_.trim(csv_str)), (row) =>
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

    const year1 = fiscal_year_to_year(fyear1) || undefined;
    const year2 = fiscal_year_to_year(fyear2) || undefined;

    const text = sanitized_marked(run_template(footnote));

    // TODO footnote data has a somewhat legacy "subject_class" column. These should be subject_type values, and they are
    // ... with the exception of CRSO being all-caps. Sort that out with the pipeline some time
    const subject_type = subject_class === "CRSO" ? "crso" : subject_class;

    // TODO footnotes currently only work for class subjects, expand to allow for API only subjects
    if (!is_class_subject_types(subject_type)) {
      throw new Error(
        `Invalid subject type "${subject_type}" for footnote "${id}", options are ${class_subject_types}`
      );
    }

    footNoteStore.create_and_register({
      id,
      subject_type,
      subject_id,
      year1,
      year2,
      topic_keys: split_topic_keys,
      text,
    });
  });
}

// note: gov footnotes always loaded right now, they're part of the global footnotes bundle loaded through the big lookups blob
const _loaded_footnote_bundle_ids: Record<string, boolean> = { gov: true };

function load_footnotes_bundle(
  subject: SubjectClassInstance | "estimates" | "all"
) {
  const footnote_bundle_id = (() => {
    if (typeof subject === "string") {
      if (subject === "estimates") {
        return "estimates";
      } else {
        return "all";
      }
    } else {
      if (subject instanceof Dept) {
        return subject.dept_code;
      } else if (subject instanceof CRSO || subject instanceof Program) {
        return subject.dept.dept_code;
      } else {
        return subject.id;
      }
    }
  })();

  if (
    typeof footnote_bundle_id === "undefined" ||
    _loaded_footnote_bundle_ids["all"] ||
    _loaded_footnote_bundle_ids[footnote_bundle_id]
  ) {
    return Promise.resolve();
  }

  // reminder: the funky .json.js exstension is to ensure that Cloudflare caches these, as it usually won't cache .json
  return make_request(
    get_static_url(`footnotes/fn_${lang}_${footnote_bundle_id}.json.js`)
  )
    .then((resp) => resp.text())
    .then((csv_str) => {
      populate_footnotes(csv_str);
      _loaded_footnote_bundle_ids[footnote_bundle_id] = true;
    });
}

//this is exposed so populate stores can make the 'global' class-level footnotes that will be used by every infograph.
function populate_global_footnotes(csv_str: string) {
  populate_footnotes(csv_str);

  _.each(get_dynamic_footnote_definitions(), function (footnote_config) {
    footNoteStore.create_and_register(footnote_config);
  });
}

export { load_footnotes_bundle, populate_global_footnotes };
