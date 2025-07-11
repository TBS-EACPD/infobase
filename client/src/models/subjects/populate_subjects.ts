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
  org_to_minister: ParsedCsvWithUndefineds,
  dept_code_to_csv_name: ParsedCsvWithUndefineds,
  crso: ParsedCsvWithUndefineds
) => {
  _.each(ministries, ({ id, name_en, name_fr }) => {
    Dept.ministryStore.create_and_register({
      ...enforced_required_fields({
        id,
        name: is_en ? name_en : name_fr,
      }),
    });
  });

  _.each(ministers, ({ id, name_en, name_fr }) => {
    Dept.ministerStore.create_and_register({
      ...enforced_required_fields({
        id,
        name: is_en ? name_en : name_fr,
      }),
    });
  });

  _.each(inst_forms, ({ id, parent_id, name_en, name_fr }) => {
    Dept.instFormStore.create_and_register({
      ...enforced_required_fields({
        id,
        name: is_en ? name_en : name_fr,
      }),

      parent_id,
    });
  });

  _.each(
    igoc,
    ({
      org_id: id,
      dept_code,
      abbr_en,
      abbr_fr,
      legal_title_en,
      legal_title_fr,
      applied_title_en,
      applied_title_fr,
      old_applied_title_en,
      old_applied_title_fr,
      status: status_code,
      enabling_instrument_en: legislation_en,
      enabling_instrument_fr: legislation_fr,
      description_en: raw_mandate_en,
      description_fr: raw_mandate_fr,
      pas: pas_code,
      faa_schedule_institutional: schedule,
      faa_schedule_hr_status: faa_hr,
      auditor_en,
      auditor_fr,
      incorp_yr,
      federal_ownership_en: fed_ownership_en,
      federal_ownership_fr: fed_ownership_fr,
      end_yr,
      notes_en,
      notes_fr,
      dp_status: dp_status_code,
      ministry: ministry_id,
      institutional_form: inst_form_id,
      eval_url_en,
      eval_url_fr,
      dept_website_en,
      dept_website_fr,
      article1_fr,
      article2_fr,
    }) => {
      Dept.store.create_and_register({
        ...enforced_required_fields({
          id,
          legal_title: is_en ? legal_title_en : legal_title_fr,
          status_code,
          incorp_yr,
          dp_status_code,
          inst_form_id,
          other_lang_legal_title: is_en ? legal_title_fr : legal_title_en,
        }),

        dept_code,
        abbr: is_en ? abbr_en : abbr_fr,
        applied_title: is_en ? applied_title_en : applied_title_fr,
        old_applied_title: is_en ? old_applied_title_en : old_applied_title_fr,
        legislation: is_en ? legislation_en : legislation_fr,
        raw_mandate: is_en ? raw_mandate_en : raw_mandate_fr,
        pas_code,
        schedule,
        faa_hr,
        auditor: is_en ? auditor_en : auditor_fr,
        fed_ownership: is_en ? fed_ownership_en : fed_ownership_fr,
        end_yr,
        notes: is_en ? notes_en : notes_fr,
        other_lang_abbr: is_en ? abbr_fr : abbr_en,
        other_lang_applied_title: is_en ? applied_title_fr : applied_title_en,
        dept_website: is_en ? dept_website_en : dept_website_fr,
        eval_url: is_en ? eval_url_en : eval_url_fr,

        le_la: article1_fr,
        du_de_la: article2_fr,

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
  _.each(
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
  _.each(
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
  _.each(
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
