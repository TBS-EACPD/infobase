import { csvParse } from "d3-dsv";
import _ from "lodash";

import { lang } from "src/core/injected_build_constants";

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
const lookups_file_name = `lookups_${lang}.json`;

// TODO, work with pipeline to clean up the headers in igoc_en.csv etc some time, strip the unwanted _en/_fr instances
const MONOLINGUAL_CSVS_WITH_BILINGUAL_HEADERS = ["igoc", "crso", "program"];

export const populate_stores = () =>
  // reminder: the funky .json.js exstension is to ensure that Cloudflare caches these, as it usually won't cache .json
  make_request(get_static_url(`${lookups_file_name}.js`)).then((text) => {
    process_lookups(JSON.parse(text));
  });

const process_lookups = ({
  global_footnotes_csv_string,
  ...lookup_csv_strings
}: {
  [x: string]: string;
}) => {
  // outlier for lookups json, a calculated output of the build base script, not a directly stringified csv
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
      ...required_fields({
        id,
        name: is_en ? name_en : name_fr,
      }),

      org_ids: _.chain(igoc)
        .filter(({ ministry }) => ministry === id)
        .map("org_id")
        .compact()
        .value(),
    })
  );

  _.each(ministers, ({ id, name_en, name_fr }) =>
    Minister.store.create_and_register({
      ...required_fields({
        id,
        name: is_en ? name_en : name_fr,
      }),

      org_ids: _.chain(org_to_minister)
        .filter(({ minister }) => minister === id)
        .map("department")
        .compact()
        .value(),
    })
  );

  _.each(inst_forms, ({ id, parent_id, name_en, name_fr }) =>
    InstForm.store.create_and_register({
      ...required_fields({
        id,
        name: is_en ? name_en : name_fr,
      }),

      parent_id,

      children_ids: _.chain(inst_forms)
        .filter(({ parent_id }) => parent_id === id)
        .map("id")
        .compact()
        .value(),
      org_ids: _.chain(igoc)
        .filter(({ institutional_form }) => institutional_form === id)
        .map("org_id")
        .compact()
        .value(),
    })
  );

  const get_url_from_url_lookup = (url_key: string | undefined) => {
    const url_row = _.find(url_lookups, ({ id }) => id === url_key);
    return url_row?.[is_en ? "url_en" : "url_fr"] || "";
  };
  _.each(
    igoc,
    ({
      org_id: id,
      dept_code,
      abbr,
      legal_title,
      applied_title,
      old_applied_title,
      status: status_code,
      enabling_instrument: legislation,
      description: raw_mandate,
      pas: pas_code,
      faa_schedule_institutional: schedule,
      faa_schedule_hr_status: faa_hr,
      auditor,
      incorp_yr,
      federal_ownership: fed_ownership,
      end_yr,
      notes,
      dp_status: dp_status_code,
      ministry: ministry_id,
      institutional_form: inst_form_id,
      eval_url_id,
      dept_website_id,
      article1,
      article2,
      other_lang_abbr,
      other_lang_applied_title,
      other_lang_legal_title,
    }) =>
      Dept.store.create_and_register({
        ...required_fields({
          id,
          legal_title,
          status_code,
          incorp_yr,
          dp_status_code,
          inst_form_id,
          other_lang_legal_title,
        }),

        dept_code,
        abbr,
        applied_title,
        old_applied_title,
        legislation,
        raw_mandate,
        pas_code,
        schedule,
        faa_hr,
        auditor,
        fed_ownership,
        end_yr,
        notes,
        other_lang_abbr,
        other_lang_applied_title,

        eval_url: get_url_from_url_lookup(eval_url_id),
        website_url: get_url_from_url_lookup(dept_website_id),
        le_la: article1 || "",
        du_de_la: article2 || "",

        ministry_id,
        minister_ids: _.chain(org_to_minister)
          .filter(({ department }) => department === id)
          .map("minister")
          .compact()
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
          .compact()
          .value(),
      })
  );

  _.each(
    crso,
    ({ id, dept_code, name, desc, is_active, is_drf, is_internal_service }) => {
      CRSO.store.create_and_register({
        ...required_fields({
          id,
          name,
          description: desc,
        }),
        activity_code: _.chain(id).split("-").last().value(),
        dept_id: _.find(igoc, { dept_code })?.org_id as string,
        program_ids: _.chain(program)
          .filter(({ crso_id }) => crso_id === id)
          .map(
            ({ dept_code, activity_code }) =>
              dept_code &&
              activity_code &&
              Program.make_program_id(dept_code, activity_code)
          )
          .compact()
          .value(),
        is_active: is_active === "1",
        is_drf: is_drf === "1",
        is_internal_service: is_internal_service === "1",
      });
    }
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
    }) => {
      if (
        typeof dept_code === "undefined" ||
        typeof activity_code === "undefined"
      ) {
        throw new Error(
          `Row in program lookup is missing a dept_code and/or activity code`
        );
      }

      Program.store.create_and_register({
        ...required_fields({
          id: Program.make_program_id(dept_code, activity_code),
          activity_code,
          crso_id,
          name,
          description: _.trim(
            desc?.replace(/^<p>/i, "").replace(/<\/p>$/i, "")
          ),
        }),

        old_name,
        is_active: is_active === "1",
        is_internal_service: is_internal_service === "1",
        is_fake: is_fake_program === "1",

        tag_ids: _.chain(tags_to_programs)
          .filter(
            ({ program_id }) =>
              program_id === Program.make_program_id(dept_code, activity_code)
          )
          .map("tag_id")
          .compact()
          .value(),
      });
    }
  );

  // SUBJECT_TS_TODO not filtering CCOFOGs here right now, either add that back or get them dropped upstream to coincide with this branch
  _.each(
    program_tag_types,
    ({ id, type: cardinality, name_en, name_fr, desc_en, desc_fr }) =>
      ProgramTag.store.create_and_register({
        ...required_fields({
          id,
          name: is_en ? name_en : name_fr,
          cardinality,
        }),

        description_raw: is_en ? desc_en : desc_fr,

        children_tag_ids: _.chain(program_tags)
          .filter(({ parent_id }) => parent_id === id)
          .map("tag_id")
          .compact()
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
        ...required_fields({
          id,
          name: is_en ? name_en : name_fr,
          parent_tag_id,
        }),

        description_raw: is_en ? desc_en : desc_fr,

        parent_tag_id,
        children_tag_ids: _.chain(program_tags)
          .filter(({ parent_id }) => parent_id === id)
          .map("tag_id")
          .compact()
          .value(),
        program_ids: _.chain(tags_to_programs)
          .filter(({ tag_id }) => tag_id === id)
          .map("program_id")
          .compact()
          .value(),
      })
  );

  _.each(glossary, ({ id, name_en, name_fr, def_en, def_fr }) => {
    const raw_definition = is_en ? def_en : def_fr;

    raw_definition &&
      glossaryEntryStore.create_and_register({
        ...required_fields({
          id,
          title: is_en ? name_en : name_fr,
          translation: is_en ? name_fr : name_en,
          raw_definition,
        }),
      });
  });
};

const required_fields = <
  RequiredFields extends Record<string, string | undefined>
>(
  required_fields: RequiredFields
) => {
  _.each(required_fields, (cell, key) => {
    if (typeof cell === "undefined") {
      throw new Error(`Required field "${key}" has an empty cell`);
    }
  });

  return required_fields as unknown as {
    [key in keyof RequiredFields]: string;
  };
};
