import _ from "lodash";
import mongoose from "mongoose";

import {
  create_resource_by_foreignkey_attr_dataloader,
  create_resource_by_id_attr_dataloader,
} from "../loader_utils.js";
import {
  str_type,
  bilingual,
  pkey_type,
  parent_fkey_type,
} from "../model_utils.js";

export default function define_core_subjects(model_singleton) {
  const OrgSchema = new mongoose.Schema({
    org_id: pkey_type(),
    dept_code: {
      ...str_type,
      index: true,
      sparse: true,
    },
    ministry_id: str_type,
    inst_form_id: str_type,
    faa_schedule_institutional: str_type,
    faa_schedule_hr_status: str_type,
    status: str_type,
    incorp_yr: str_type,
    end_yr: str_type,
    pas: str_type,
    dp_status: str_type,
    ...bilingual("name", { ...str_type, required: true }),
    ...bilingual("legal_title", { ...str_type, required: true }),
    ...bilingual("applied_title", str_type),
    ...bilingual("old_applied_title", str_type),
    ...bilingual("acronym", str_type),
    ...bilingual("description", str_type),
    ...bilingual("notes", str_type),
    ...bilingual("federal_ownership", str_type),
    ...bilingual("enabling_instrument", str_type),
    ...bilingual("auditor", str_type),
    ...bilingual("dp_url", str_type),
    ...bilingual("qfr_url", str_type),
    ...bilingual("eval_url", str_type),
    ...bilingual("dept_website_url", str_type),
    article1_fr: str_type,
    article2_fr: str_type,
  });
  OrgSchema.index(
    {
      ...bilingual("name", "text"),
      ...bilingual("applied_title", "text"),
      ...bilingual("acronym", "text"),
      ...bilingual("description", "text"),
      ...bilingual("legal_title", "text"),
    },
    {
      name: "org_search_ix",
      weights: {
        ...bilingual("name", 5),
        ...bilingual("applied_title", 5),
        ...bilingual("legal_title", 5),
        ...bilingual("description", 2),
        ...bilingual("acronym", 1),
      },
    }
  );

  const ProgramSchema = new mongoose.Schema({
    dept_code: parent_fkey_type(),
    activity_code: {
      ...str_type,
      required: true,
    },
    crso_id: parent_fkey_type(),
    program_id: pkey_type(),
    is_internal_service: { type: Boolean },
    is_crown: { type: Boolean },
    is_active: { type: Boolean },
    ...bilingual("name", { ...str_type, required: true }),
    ...bilingual("old_name", str_type),
    ...bilingual("description", str_type),
  });
  ProgramSchema.index(
    {
      ...bilingual("name", "text"),
      ...bilingual("description", "text"),
      ...bilingual("old_name", "text"),
    },
    {
      name: "program_search_ix",
      weights: {
        ...bilingual("name", 5),
        ...bilingual("old_name", 4),
        ...bilingual("description", 2),
      },
    }
  );

  // "id","dept_code","name_en","name_fr","desc_en","desc_fr","is_active"
  const CrsoSchema = mongoose.Schema({
    // TODO: add CR codes
    crso_id: pkey_type(),
    dept_code: parent_fkey_type(),
    ...bilingual("name", str_type),
    ...bilingual("description", str_type),
    is_active: { type: Boolean },
  });
  CrsoSchema.index(
    {
      ...bilingual("name", "text"),
      ...bilingual("description", "text"),
    },
    {
      name: "crso_search_ix",
      weights: {
        ...bilingual("name", 5),
        ...bilingual("description", 2),
      },
    }
  );

  //TODO:
  // InstForm,
  // Ministry,
  // Minister,

  model_singleton.define_model("Org", OrgSchema);
  model_singleton.define_model("Program", ProgramSchema);
  model_singleton.define_model("Crso", CrsoSchema);

  const { Org, Program, Crso } = model_singleton.models;

  const loaders = {
    org_deptcode_loader: create_resource_by_id_attr_dataloader(
      Org,
      "dept_code"
    ),
    org_id_loader: create_resource_by_id_attr_dataloader(Org, "org_id"),
    prog_dept_code_loader: create_resource_by_foreignkey_attr_dataloader(
      Program,
      "dept_code"
    ),
    prog_crso_id_loader: create_resource_by_foreignkey_attr_dataloader(
      Program,
      "crso_id"
    ),
    prog_id_loader: create_resource_by_id_attr_dataloader(
      Program,
      "program_id"
    ),
    crso_from_deptcode_loader: create_resource_by_foreignkey_attr_dataloader(
      Crso,
      "dept_code"
    ),
    crso_id_loader: create_resource_by_id_attr_dataloader(Crso, "crso_id"),
  };
  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));

  const search_orgs = create_searcher(Org);
  const search_programs = create_searcher(Program);
  const search_crsos = create_searcher(Crso);

  const search_subjects = async (query, lang) => {
    //This one is just for example sake
    const [orgs, crsos, programs] = await Promise.all([
      search_orgs(query, lang),
      search_crsos(query, lang),
      search_programs(query, lang),
    ]);

    return _.chain([...orgs, ...crsos, ...programs])
      .sortBy("score")
      .reverse()
      .value();
  };

  model_singleton.define_service("search_orgs", search_orgs);
  model_singleton.define_service("search_programs", search_programs);
  model_singleton.define_service("search_crsos", search_crsos);
  model_singleton.define_service("search_subjects", search_subjects);
}

const create_searcher = (model) => async (query, lang) => {
  const records = await model.find(
    {
      $text: {
        $search: query,
        $language: lang === "en" ? "english" : "french",
        $caseSensitive: false,
        $diacriticSensitive: false,
      },
    },
    { score: { $meta: "textScore" } }
  );

  return _.chain(records)
    .map((row) => ({
      record: row,
      score: row._doc.score,
    }))
    .sortBy("score")
    .reverse()
    .value();
};
