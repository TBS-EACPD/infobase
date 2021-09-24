import { csvParse } from "d3-dsv";
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
  ProgramTag,
} from "./subject_index";

const is_en = lang === "en";

// TODO, work with pipeline to clean up the headers in igoc_en.csv etc some time, strip the unwanted _en/_fr instances
const MONOLINGUAL_CSVS_WITH_BILINGUAL_HEADERS = ["igoc", "crso", "program"];

export const populate_stores = () =>
  // reminder: the funky .json.js exstension is to ensure that Cloudflare caches these, as it usually won't cache .json
  make_request(get_static_url(`lookups_${lang}.json.js`)).then((text) => {
    process_lookups(JSON.parse(text));
  });

const process_lookups = ({
  global_footnotes_csv_string,
  ...lookup_csv_strings
}) => {
  // outlier for the data crammed in to lookups_[lang].json, is a processed output of the coppy_static_assets script, not a direct copy of a csv
  populate_global_footnotes(global_footnotes_csv_string);

  const {
    dept_code_to_csv_name,
    org_to_minister,
    inst_forms,
    ministers,
    ministries,
    url_lookups,
    igoc,
    crso,
    program,
    program_tag_types,
    program_tags,
    tags_to_programs,
    glossary,
  } = _.mapValues(lookup_csv_strings, (csv_string, csv_name) =>
    _.chain(csv_string)
      .trim()
      .thru((csv_string) => {
        const csv_string_with_cleaned_headers = _.replace(
          csv_string,
          /^.+\n/,
          (header_row_string) =>
            _.chain(header_row_string)
              .replace(" ", "_")
              .toLower()
              .thru((header_row_string) =>
                _.includes(MONOLINGUAL_CSVS_WITH_BILINGUAL_HEADERS, csv_name)
                  ? _.replace(header_row_string, /"(.*?)_[ef][nr]"/g, '"$1"')
                  : header_row_string
              )
              .value()
        );

        return csvParse(csv_string_with_cleaned_headers);
      })
      .value()
  );

  _.each(ministries, ({ id, name_en, name_fr }) =>
    Ministry.store.create_and_register({
      id,
      name: is_en ? name_en : name_fr,
      org_ids: _.chain(igoc)
        .filter(({ ministry }) => ministry === id)
        .map("org_id")
        .value(),
    })
  );

  _.each(ministers, ({ id, name_en, name_fr }) =>
    Minister.store.create_and_register({
      id,
      name: is_en ? name_en : name_fr,
      org_ids: _.chain(org_to_minister)
        .filter(({ minister }) => minister === id)
        .map("department")
        .value(),
    })
  );

  _.each(inst_forms, ({ id, parent_id, name_en, name_fr }) =>
    InstForm.store.create_and_register({
      id,
      name: is_en ? name_en : name_fr,
      parent_id,
      children_ids: _.chain(inst_forms)
        .filter(({ parent_id }) => parent_id === id)
        .map("id")
        .value(),
      org_ids: _.chain(igoc)
        .filter(({ institutional_form }) => institutional_form === id)
        .map("org_id")
        .value(),
    })
  );

  const get_url_from_url_lookup = (url_key) => {
    const url_row = _.find(url_lookups, ({ id }) => id === url_key);
    return url_row?.[is_en ? "url_en" : "url_fr"] || "";
  };
  _.each(
    igoc,
    ({
      org_id: id,
      dept_code,
      status: status_code,
      enabling_instrument: legislation,
      description: raw_mandate,
      pas: pas_code,
      faa_schedule_institutional: schedule,
      faa_schedule_hr_status: faa_hr,
      federal_ownership: fed_ownership,
      dp_status: dp_status_code,
      ministry: ministry_id,
      institutional_form: inst_form_id,
      eval_url_id,
      dept_website_id,
      article1,
      article2,
      ...unprocessed_properties
    }) =>
      Dept.store.create_and_register({
        id,
        dept_code,
        status_code,
        legislation,
        raw_mandate,
        pas_code,
        schedule,
        faa_hr,
        fed_ownership,
        dp_status_code,
        inst_form_id,
        ministry_id,
        minister_ids: _.chain(org_to_minister)
          .filter(({ department }) => department === id)
          .map("minister")
          .value(),
        table_ids: _.chain(dept_code_to_csv_name)
          .filter(
            ({ dept_code: lookup_dept_code }) => lookup_dept_code === dept_code
          )
          .map(({ id: csv_name }) => _.camelCase(csv_name))
          .value(),
        crso_ids: _.chain(crso)
          .filter(
            ({ dept_code: crso_dept_code }) => crso_dept_code === dept_code
          )
          .map("id")
          .value(),
        eval_url: get_url_from_url_lookup(eval_url_id),
        website_url: get_url_from_url_lookup(dept_website_id),
        le_la: article1 || "",
        du_de_la: article2 || "",
        ...unprocessed_properties,
      })
  );

  const get_program_id = ({ dept_code, activity_code }) =>
    `${dept_code}-${activity_code}`;

  _.each(
    crso,
    ({ id, dept_code, name, desc, is_active, is_drf, is_internal_service }) =>
      CRSO.store.create_and_register({
        id,
        activity_code: _.chain(id).split("-").last().value(),
        dept_id: _.find(igoc, { dept_code }).org_id,
        program_ids: _.chain(program)
          .filter(({ crso_id }) => crso_id === id)
          .map(get_program_id)
          .value(),
        name,
        description: desc,
        is_active: is_active === "1",
        is_drf: is_drf === "1",
        is_internal_service: is_internal_service === "1",
      })
  );

  _.each(
    program,
    ({
      dept_code,
      activity_code,
      crso_id,
      name,
      old_name,
      desc,
      is_active,
      is_internal_service,
      is_fake_program,
    }) =>
      Program.store.create_and_register({
        id: get_program_id({ dept_code, activity_code }),
        activity_code,
        crso_id,
        tag_ids: _.chain(tags_to_programs)
          .filter(
            ({ program_id }) =>
              program_id === get_program_id({ dept_code, activity_code })
          )
          .map("tag_id")
          .value(),
        name,
        old_name,
        description: _.trim(desc.replace(/^<p>/i, "").replace(/<\/p>$/i, "")),
        is_active: is_active === "1",
        is_internal_service: is_internal_service === "1",
        is_fake: is_fake_program === "1",
      })
  );

  _.each(
    program_tag_types,
    ({ id, type: cardinality, name_en, name_fr, desc_en, desc_fr }) =>
      ProgramTag.store.create_and_register({
        id,
        cardinality,
        name: is_en ? name_en : name_fr,
        description: is_en ? desc_en : desc_fr,
        children_tag_ids: _.chain(program_tags)
          .filter(({ parent_id }) => parent_id === id)
          .map("tag_id")
          .value(),
      })
  );
  _.each(
    program_tags,
    ({
      tag_id: id,
      parent_id: parent_tag_id,
      name_en,
      name_fr,
      desc_en,
      desc_fr,
    }) =>
      ProgramTag.store.create_and_register({
        id,
        name: is_en ? name_en : name_fr,
        description: sanitized_marked(is_en ? desc_en : desc_fr),
        parent_tag_id,
        children_tag_ids: _.chain(program_tags)
          .filter(({ parent_id }) => parent_id === id)
          .map("tag_id")
          .value(),
        program_ids: _.chain(tags_to_programs)
          .filter(({ tag_id }) => tag_id === id)
          .map("program_id")
          .value(),
      })
  );

  populate_glossary(glossary);
};

const populate_glossary = (glossary) =>
  _.chain(glossary)
    .map(({ id, name_en, name_fr, def_en, def_fr }) => ({
      id,
      title: is_en ? name_en : name_fr,
      translation: is_en ? name_fr : name_en,
      raw_definition: is_en ? def_en : def_fr,
    }))
    .filter("raw_definition")
    .each(glossaryEntryStore.create_and_register)
    .value();
