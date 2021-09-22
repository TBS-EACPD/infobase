import { csvParseRows } from "d3-dsv";
import _ from "lodash";

import { lang } from "src/core/injected_build_constants";

import { sanitized_marked } from "src/general_utils";
import { get_static_url, make_request } from "src/request_utils";

import { populate_global_footnotes } from "./footnotes/populate_footnotes";
import { glossaryEntryStore } from "./glossary";
import {
  Ministry,
  Program,
  Dept,
  CRSO,
  Minister,
  InstForm,
  Tag,
} from "./subject_index";

const url_id = (num) => `_${num}`; //make sure the regular keys from the pipeline aren't interpreted as array indices
function populate_igoc_models({
  dept_to_table_id,
  org_to_ministers,
  inst_forms,
  ministers,
  ministries,
  urls,
  igoc_rows,
}) {
  const is_en = lang === "en";

  _.each(ministries, ([id, name_en, name_fr]) => {
    Ministry.store.create_and_register({
      id,
      name: is_en ? name_en : name_fr,
      org_ids: _.chain(igoc_rows)
        .filter((row) => row[18] === id) // SUBJECT_TS_TODO this stinks... maybe it's time to start actually using CSV headers, for the igoc at least
        .map(([org_id]) => org_id)
        .value(),
    });
  });

  _.each(ministers, ([id, name_en, name_fr]) => {
    Minister.store.create_and_register({
      id,
      name: is_en ? name_en : name_fr,
      org_ids: _.chain(org_to_ministers)
        .filter(([_org_id, minister_id]) => minister_id === id)
        .map(([org_id]) => org_id)
        .value(),
    });
  });

  _.each(inst_forms, ([id, parent_id, name_en, name_fr]) => {
    InstForm.store.create_and_register({
      id,
      name: is_en ? name_en : name_fr,
      parent_id,
      children_ids: _.chain(inst_forms)
        .filter(({ parent_id }) => parent_id === id)
        .map("id")
        .value(),
      org_ids: _.chain(igoc_rows)
        .filter((row) => row[19] === id) // SUBJECT_TS_TODO this stinks... maybe it's time to start actually using CSV headers, for the igoc at least
        .map(([org_id]) => org_id)
        .value(),
    });
  });

  const url_lookup = _.chain(urls)
    .map(([id, en, fr]) => [url_id(id), is_en ? en : fr])
    .fromPairs()
    .value();

  _.each(
    igoc_rows,
    ([
      id,
      dept_code,
      abbr,
      legal_title,
      applied_title,
      old_applied_title,
      status_code,
      legislation,
      raw_mandate,
      pas_code,
      schedule,
      faa_hr,
      auditor,
      incorp_yr,
      fed_ownership,
      end_yr,
      notes,
      dp_status_code,
      ministry_id,
      inst_form_id,
      eval_url_id,
      website_url_id,
      article1,
      article2,
      other_lang_abbr,
      other_lang_applied_title,
      other_lang_legal_title,
    ]) => {
      const [eval_url, website_url] = _.map(
        [eval_url_id, website_url_id],
        (url_key) => url_lookup[url_id(url_key)]
      );

      Dept.store.create_and_register({
        id,
        dept_code,
        abbr,
        legal_title,
        applied_title,
        old_applied_title,
        status_code,
        legislation,
        raw_mandate,
        pas_code,
        schedule,
        faa_hr,
        auditor,
        incorp_yr,
        fed_ownership,
        end_yr,
        notes,
        dp_status_code,
        inst_form_id,
        ministry_id,
        minister_ids: _.chain(org_to_ministers)
          .filter(([org_id]) => org_id === id)
          .map(([_org_id, minister_id]) => minister_id)
          .value(),
        table_ids: _.chain(dept_to_table_id)
          .filter(([lookup_dept_code]) => lookup_dept_code === dept_code)
          .map(([_dept_code, table_id]) => table_id)
          .value(),
        eval_url,
        website_url,
        le_la: article1 || "",
        du_de_la: article2 || "",
        other_lang_abbr,
        other_lang_applied_title,
        other_lang_legal_title,
      });
    }
  );
}

function populate_glossary(lines) {
  let [term_col, def_col, translation_col] = [1, 3, 2];
  if (lang === "fr") {
    term_col++;
    def_col++;
    translation_col--;
  }
  const [key, term, markdown_def, translation] = [
    0,
    term_col,
    def_col,
    translation_col,
  ];
  _.chain(lines)
    .filter((line) => !_.isEmpty(line[markdown_def]))
    .each((line) => {
      glossaryEntryStore.create_and_register({
        id: line[key],
        title: line[term],
        raw_definition: line[markdown_def],
        translation: line[translation],
      });
    })
    .value();
}

function create_tag_branches(program_tag_types) {
  const l = lang === "en";
  _.each(program_tag_types, (row) => {
    Tag.store.create_and_register({
      id: row[0],
      cardinality: row[1],
      name: row[l ? 2 : 3],
      description: row[l ? 4 : 5],
    });
  });
}

function populate_program_tags(tag_rows) {
  // assumes the parent tags will be listed first
  const l = lang === "en";
  const [tag_id, parent_id, name_en, name_fr, desc_en, desc_fr] = _.range(6);
  _.each(tag_rows, (row) => {
    const parent_tag = Tag.store.lookup(row[parent_id]);
    //HACKY: Note that parent rows must precede child rows
    const instance = Tag.store.create_and_register({
      id: row[tag_id],
      name: row[l ? name_en : name_fr],
      description: sanitized_marked(row[l ? desc_en : desc_fr]),
      root: parent_tag.root,
      cardinality: parent_tag.root.cardinality,
      parent_tag,
    });
    parent_tag.children_tags.push(instance);
  });
}

function populate_crsos(rows) {
  const [id, dept_code, title, desc, is_active, is_drf, is_internal_service] = [
    0, 1, 2, 3, 4, 5, 6, 7,
  ];
  _.each(rows, (row) => {
    const dept = Dept.store.lookup(row[dept_code]);
    const instance = CRSO.create_and_register({
      dept,
      id: row[id],
      activity_code: _.chain(row[id]).split("-").last().value(),
      name: row[title],
      description: row[desc],
      is_active: !!+row[is_active],
      is_drf: !!+row[is_drf],
      is_internal_service: !!+row[is_internal_service],
    });
    dept.crsos.push(instance);
  });
}

function populate_programs(rows) {
  //TODO what do we use is_crown for ?
  /* eslint-disable no-unused-vars */
  const [
    dept_code,
    crso_id,
    activity_code,
    name,
    old_name,
    desc,
    is_crown,
    is_active,
    is_internal_service,
    is_fake,
  ] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  _.each(rows, (row) => {
    const crso = CRSO.lookup(row[crso_id]);
    const instance = Program.create_and_register({
      crso,
      activity_code: row[activity_code],
      dept: Dept.store.lookup(row[dept_code]),
      description: _.trim(
        row[desc].replace(/^<p>/i, "").replace(/<\/p>$/i, "")
      ),
      name: row[name],
      old_name: row[old_name],
      is_active: !!+row[is_active],
      is_internal_service: row[is_internal_service] === "1",
      is_fake: row[is_fake] === "1",
    });
    crso.programs.push(instance);
  });
}

function populate_program_tag_linkages(programs_m2m_tags) {
  _.each(programs_m2m_tags, (row) => {
    const [program_id, tagID] = row;
    const program = Program.lookup(program_id);
    const tag = Tag.store.lookup(tagID);
    const tag_root_id = tag.root.id;

    // CCOFOGs are currently disabled, they have quirks to resolve and code around (duplicated nodes as you go down, some tagging done at the root level some at other levels, etc.)
    if (tag_root_id === "CCOFOG") {
      return;
    }

    program.tags.push(tag);
    tag.programs.push(program);
  });
}

function process_lookups(data) {
  //convert the csv's to rows and drop their headers
  _.chain(data)
    .omit("global_footnotes") //global footnotes already has its header dropped
    .each((csv_str, key) => {
      data[key] = csvParseRows(_.trim(csv_str));
      data[key].shift(); // drop the header
    })
    .value();

  //TODO: stop referring to data by the names of its csv, design an interface with copy_static_assets.js
  populate_igoc_models({
    dept_to_table_id: _.map(data["dept_code_to_csv_name.csv"], (row) => [
      row[0],
      _.camelCase(row[1]),
    ]),
    org_to_ministers: data["org_to_minister.csv"],
    inst_forms: data["inst_forms.csv"],
    ministers: data["ministers.csv"],
    ministries: data["ministries.csv"],
    urls: data["url_lookups.csv"],
    igoc_rows: data["igoc.csv"],
  });
  populate_crsos(data["crso.csv"]);
  populate_programs(data["program.csv"]);

  create_tag_branches(data["program_tag_types.csv"]);
  populate_program_tags(data["program_tags.csv"]);

  //once all programs and tags are created, link them
  populate_program_tag_linkages(data["tags_to_programs.csv"]);

  populate_glossary(data[`glossary.csv`]);
  populate_global_footnotes(data.global_footnotes);
}

export const populate_stores = function () {
  // reminder: the funky .json.js exstension is to ensure that Cloudflare caches these, as it usually won't cache .json
  return make_request(get_static_url(`lookups_${lang}.json.js`)).then(
    (text) => {
      process_lookups(JSON.parse(text));
    }
  );
};
