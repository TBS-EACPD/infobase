import _ from "lodash";

import {
  get_standard_csv_file_rows,
  create_program_id,
  bilingual_remap,
} from "../load_utils.js";

export default async function ({ models }) {
  const { Org, Program, Crso } = models;

  const url_lookups = _.keyBy(
    get_standard_csv_file_rows("url_lookups.csv"),
    "id"
  );

  const org_objs = _.chain(get_standard_csv_file_rows("igoc.csv"))
    .map((obj) => ({
      ...obj,
      ministry_id: obj.ministry,
      inst_form_id: obj.institutional_form,
      name_en: obj.applied_title_en || obj.legal_title_en,
      name_fr: obj.applied_title_fr || obj.legal_title_fr,
      ...bilingual_remap(obj, "acronym", "abbr"),
      ...bilingual_remap(url_lookups[obj.eval_url_id], "eval_url", "url"),
      ...bilingual_remap(
        url_lookups[obj.dept_website_id],
        "dept_website_url",
        "url"
      ),
    }))
    .map((rec) => new Org(rec))
    .value();

  await Org.insertMany(org_objs);

  const crso_objs = _.chain(get_standard_csv_file_rows("crso.csv"))
    .map((obj) => ({
      ..._.omit(obj, "id"),
      crso_id: obj.id,
      is_active: obj.is_active === "1",
      ...bilingual_remap(obj, "description", "desc"),
    }))
    .map((obj) => new Crso(obj))
    .value();

  await Crso.insertMany(crso_objs);

  const program_objs = _.chain(get_standard_csv_file_rows("program.csv"))
    .map((obj) => ({
      ...obj,
      program_id: create_program_id(obj),
      is_crown: obj.is_crown === "1",
      is_active: obj.is_active === "1",
      is_internal_service: obj.is_internal_service === "1",
      ...bilingual_remap(obj, "description", "desc"),
    }))
    .map((obj) => new Program(obj))
    .value();

  return await Program.insertMany(program_objs);
}
