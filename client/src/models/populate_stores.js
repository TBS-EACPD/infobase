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

const is_en = lang === "en";

const url_id = (num) => `_${num}`; //make sure the regular keys from the pipeline aren't interpreted as array indices
const populate_igoc_models = ({
  dept_to_table_id,
  org_to_ministers,
  inst_forms,
  ministers,
  ministries,
  urls,
  igoc_rows,
}) => {
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
};

const populate_glossary = (rows) =>
  _.chain(rows)
    .map(([id, term_en, term_fr, def_en, def_fr]) => ({
      id,
      title: is_en ? term_en : term_fr,
      translation: is_en ? term_fr : term_en,
      raw_definition: is_en ? def_en : def_fr,
    }))
    .filter("raw_definition")
    .each(glossaryEntryStore.create_and_register)
    .value();

const create_tag_branches = (program_tag_types) =>
  _.each(
    program_tag_types,
    ([id, cardinality, name_en, name_fr, description_en, description_fr]) => {
      Tag.store.create_and_register({
        id,
        cardinality,
        name: is_en ? name_en : name_fr,
        description: is_en ? description_en : description_fr,
      });
    }
  );

const populate_program_tags = (tag_rows) =>
  _.each(
    tag_rows,
    ([tag_id, parent_id, name_en, name_fr, desc_en, desc_fr]) => {
      //  HACKY: Note that parent rows must precede child rows in input data
      const parent_tag = Tag.store.lookup(parent_id);

      const instance = Tag.store.create_and_register({
        id: tag_id,
        name: is_en ? name_en : name_fr,
        description: sanitized_marked(is_en ? desc_en : desc_fr),
        root: parent_tag.root,
        cardinality: parent_tag.root.cardinality,
        parent_tag,
      });

      parent_tag.children_tags.push(instance);
    }
  );

const populate_crsos = (rows) =>
  _.each(
    rows,
    ([
      id,
      dept_code,
      name,
      description,
      is_active,
      is_drf,
      is_internal_service,
    ]) => {
      const dept = Dept.store.lookup(dept_code);

      const instance = CRSO.store.create_and_register({
        id,
        activity_code: _.chain(id).split("-").last().value(),
        dept,
        name,
        description,
        is_active: is_active === "1",
        is_drf: is_drf === "1",
        is_internal_service: is_internal_service === "1",
      });

      dept.crsos.push(instance);
    }
  );

const populate_programs = (rows) =>
  _.each(
    rows,
    ([
      dept_code,
      crso_id,
      activity_code,
      name,
      old_name,
      desc,
      _is_crown, //TODO why do we have is_crown in the data? If it was needed it should be looked up through the parent org anyway
      is_active,
      is_internal_service,
      is_fake,
    ]) => {
      const crso = CRSO.store.lookup(crso_id);

      const instance = Program.store.create_and_register({
        id: `${dept_code}-${activity_code}`,
        activity_code,
        dept: Dept.store.lookup(dept_code),
        crso,
        name,
        old_name,
        description: _.trim(desc.replace(/^<p>/i, "").replace(/<\/p>$/i, "")),
        is_active: is_active === "1",
        is_internal_service: is_internal_service === "1",
        is_fake: is_fake === "1",
      });

      crso.programs.push(instance);
    }
  );

const populate_program_tag_linkages = (programs_m2m_tags) =>
  _.each(programs_m2m_tags, ([program_id, tagID]) => {
    const program = Program.store.lookup(program_id);
    const tag = Tag.store.lookup(tagID);
    const tag_root_id = tag.root.id;

    // CCOFOGs are currently disabled, they have quirks to resolve and code around (duplicated nodes as you go down,
    // some tagging done at the root level some at other levels, etc.)
    if (tag_root_id === "CCOFOG") {
      return;
    }

    program.tags.push(tag);
    tag.programs.push(program);
  });

const process_lookups = (data) => {
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
};

export const populate_stores = () =>
  make_request(get_static_url(`lookups_${lang}.json.js`)).then((text) => {
    process_lookups(JSON.parse(text));
  });
