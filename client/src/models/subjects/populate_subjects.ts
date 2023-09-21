import _ from "lodash";

import type { ParsedCsvWithUndefineds } from "src/models/utils/populate_utils";
import { enforced_required_fields } from "src/models/utils/populate_utils";

import { lang } from "src/core/injected_build_constants";

import { CRSO } from "./CRSO";
import { Dept } from "./Dept";
import { Program, ProgramTag } from "./Program";

const is_en = lang === "en";

export const populate_depts = (
  ministries: ParsedCsvWithUndefineds,
  ministers: ParsedCsvWithUndefineds,
  inst_forms: ParsedCsvWithUndefineds,
  igoc: ParsedCsvWithUndefineds,
  url_lookups: ParsedCsvWithUndefineds,
  org_to_minister: ParsedCsvWithUndefineds,
  dept_code_to_csv_name: ParsedCsvWithUndefineds,
  crso: ParsedCsvWithUndefineds
) => {
  _.forEach(ministries, ({ id, name_en, name_fr }) => {
    Dept.ministryStore.create_and_register({
      ...enforced_required_fields({
        id,
        name: is_en ? name_en : name_fr,
      }),
    });
  });

  _.forEach(ministers, ({ id, name_en, name_fr }) => {
    Dept.ministerStore.create_and_register({
      ...enforced_required_fields({
        id,
        name: is_en ? name_en : name_fr,
      }),
    });
  });

  _.forEach(inst_forms, ({ id, parent_id, name_en, name_fr }) => {
    Dept.instFormStore.create_and_register({
      ...enforced_required_fields({
        id,
        name: is_en ? name_en : name_fr,
      }),

      parent_id,
    });
  });

  const get_url_from_url_lookup = (url_key: string | undefined) => {
    const url_row = _.find(url_lookups, ({ id }) => id === url_key);
    return url_row?.[`url_${lang}`] || "";
  };
  _.forEach(
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
    }) => {
      Dept.store.create_and_register({
        ...enforced_required_fields({
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
      });
    }
  );
};

export const populate_crsos = (
  crso: ParsedCsvWithUndefineds,
  igoc: ParsedCsvWithUndefineds,
  program: ParsedCsvWithUndefineds
) =>
  _.forEach(
    crso,
    ({ id, dept_code, name, desc, is_active, is_drf, is_internal_service }) => {
      CRSO.store.create_and_register({
        ...enforced_required_fields({
          id,
          name,
        }),

        description: desc,
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

export const populate_programs_and_tags = (
  program: ParsedCsvWithUndefineds,
  program_tag_types: ParsedCsvWithUndefineds,
  program_tags: ParsedCsvWithUndefineds,
  tags_to_programs: ParsedCsvWithUndefineds
) => {
  _.forEach(
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
        ...enforced_required_fields({
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
  _.forEach(
    program_tag_types,
    ({ id, type: cardinality, name_en, name_fr, desc_en, desc_fr }) => {
      ProgramTag.store.create_and_register({
        ...enforced_required_fields({
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
      });
    }
  );
  _.forEach(
    program_tags,
    ({
      tag_id: id,
      parent_id: parent_tag_id,
      name_en,
      name_fr,
      desc_en,
      desc_fr,
    }) => {
      const children_tag_ids = _.chain(program_tags)
        .filter(({ parent_id }) => parent_id === id)
        .map("tag_id")
        .compact()
        .value();
      const program_ids = _.chain(tags_to_programs)
        .filter(({ tag_id }) => tag_id === id)
        .map("program_id")
        .compact()
        .value();

      if (!_.isEmpty(children_tag_ids) && !_.isEmpty(program_ids)) {
        throw new Error(`
              Tag "${id}" has both child tags and program links. InfoBase assumes only leaf tags have program links!
              Check with the data model up stream, either there's a problem there or a lot of tag related client code will need to be revisited. 
            `);
      }

      ProgramTag.store.create_and_register({
        ...enforced_required_fields({
          id,
          name: is_en ? name_en : name_fr,
          parent_tag_id,
        }),

        description_raw: is_en ? desc_en : desc_fr,

        parent_tag_id,
        children_tag_ids,
        program_ids,
      });
    }
  );
};
