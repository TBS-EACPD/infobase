import d3_dsv from "d3-dsv";
import _ from "lodash";

// models/results has no dependencies
let all_footnotes,
  crso_deptcodes,
  program_deptcodes,
  program_tag_ids,
  global_footnotes,
  footnotes_by_deptcode,
  footnotes_by_tag_id,
  estimate_footnotes;

const estimate_topics = ["AUTH", "EST_PROC", "VOTED", "STAT"];

function populate_stores(parsed_models) {
  //initialize (or reset) the stores
  all_footnotes = [];
  crso_deptcodes = {};
  program_deptcodes = {};
  program_tag_ids = {};

  global_footnotes = [];
  estimate_footnotes = [];

  const {
    depts,
    crsos,
    programs,
    tag_prog_links,

    footnotes,
  } = parsed_models;

  _.each(crsos, ({ id, dept_code }) => {
    crso_deptcodes[id] = dept_code;
  });

  _.each(programs, ({ dept_code, activity_code, crso_id }) => {
    const prog_id = `${dept_code}-${activity_code}`;
    program_deptcodes[prog_id] = dept_code;
  });

  _.each(tag_prog_links, ({ program_id, tag_id }) => {
    if (!program_tag_ids[program_id]) {
      program_tag_ids[program_id] = [];
    }
    program_tag_ids[program_id].push(tag_id);
  });

  //initialize all depts and tags to have empty array of footnotes
  footnotes_by_deptcode = _.chain(depts)
    .map(({ org_id, dept_code }) => [dept_code, []])
    .fromPairs()
    .value();

  footnotes_by_tag_id = _.chain(program_tag_ids)
    .map() //to array
    .flatten()
    .uniq()
    .map((tag_id) => [tag_id, []])
    .fromPairs()
    .value();

  _.each(footnotes, (obj) => {
    //FIXME: once pipeline starts including unique IDs for each footnote, we can stop using index.
    //"id","subject_class","subject_id","fyear1","fyear2","keys","footnote_en","footnote_fr"
    all_footnotes.push(obj);

    const { subject_class, subject_id } = obj;

    //ESTIMATES footnotes bundle
    const topics = obj.topic_keys.split(",").map((key) => key.replace(" ", ""));
    if (!_.chain(topics).intersection(estimate_topics).isEmpty().value()) {
      estimate_footnotes.push(obj);
    }

    if (subject_class === "gov" || subject_id === "*") {
      global_footnotes.push(obj);
    } else {
      switch (subject_class) {
        case "dept": {
          const dept_code = subject_id;
          footnotes_by_deptcode[dept_code].push(obj);
          break;
        }

        case "program": {
          const dept_code = program_deptcodes[subject_id];
          footnotes_by_deptcode[dept_code].push(obj);

          const tag_ids = program_tag_ids[subject_id];
          _.each(tag_ids, (tag_id) => {
            footnotes_by_tag_id[tag_id].push(obj);
          });

          break;
        }

        case "crso": //TODO: standardize on lower/upper case accross all levels
        case "CRSO": {
          const dept_code = crso_deptcodes[subject_id];
          if (dept_code) {
            //TODO stop this from hapenning on the pipeline side
            footnotes_by_deptcode[dept_code].push(obj);
          }

          break;
        }

        case "tag": {
          const tag_id = subject_id;
          footnotes_by_tag_id[tag_id].push(obj);

          break;
        }
      }
    }
  });
}

function footnotes_to_csv_string(footnote_objs, lang) {
  const other_lang = lang === "en" ? "fr" : "en";
  const lang_specific_records = _.map(footnote_objs, (obj) => {
    const new_obj = _.clone(obj);
    new_obj["footnote"] = new_obj[`footnote_${lang}`];
    delete new_obj[`footnote_${lang}`];
    delete new_obj[`footnote_${other_lang}`];
    return new_obj;
  });

  return d3_dsv.csvFormat(lang_specific_records);
}

export function get_footnote_file_defs(file_obj, lang) {
  populate_stores(file_obj);

  return {
    depts: _.chain(footnotes_by_deptcode)
      .mapValues((val) => footnotes_to_csv_string(val, lang))
      .value(),
    tags: _.chain(footnotes_by_tag_id)
      .mapValues((val) => footnotes_to_csv_string(val, lang))
      .value(),
    global: footnotes_to_csv_string(global_footnotes, lang),
    all: footnotes_to_csv_string(all_footnotes, lang),
    estimates: footnotes_to_csv_string(estimate_footnotes, lang),
  };
}
