import _ from "lodash";
import {
  get_standard_csv_file_rows,
  create_program_id,
  bilingual_remap,
} from '../load_utils.js';

export const get_org_objs = () => {
  const url_lookups = _.keyBy(get_standard_csv_file_rows("url_lookups.csv"), 'id');

  return _.map(
    get_standard_csv_file_rows("igoc.csv"),
    obj=> ({
      ...obj,
      name_en: obj.applied_title_en || obj.legal_title_en,
      name_fr: obj.applied_title_fr || obj.legal_title_fr,
      ...bilingual_remap(obj, "description", "mandate"),
      ...bilingual_remap(obj, "acronym", "abbr"),
      ...bilingual_remap(url_lookups[obj.dp_url_id], "dp_url", "url"),
      ...bilingual_remap(url_lookups[obj.qfr_url_id], "qfr_url", "url"),
      ...bilingual_remap(url_lookups[obj.eval_url_id], "eval_url", "url"),
    })
  );
};

export const get_crso_objs = () => _.map( 
  get_standard_csv_file_rows("crso.csv"),
  obj => ({ 
    ..._.omit(obj, 'id'),
    crso_id: obj.id,
    is_active: obj.is_active === "1",
    ...bilingual_remap(obj, "description", "desc"),
  })
);

export const get_program_objs = () => _.map( 
  get_standard_csv_file_rows("program.csv"),
  obj => ({
    ...obj,
    program_id: create_program_id(obj),
    is_crown: obj.is_crown === "1",
    is_active: obj.is_active === "1",
    is_internal_service: obj.is_internal_service === "1",
    ...bilingual_remap(obj, "description", "desc"),
  })
);

export default async function({models}){
  const { Org, Program, Crso } = models;

  const org_objs = _.map( get_org_objs(), obj => new Org(obj) );
  await Org.insertMany(org_objs);

  const crso_objs = _.map( get_crso_objs, obj => new Crso(obj) )
  await Crso.insertMany(crso_objs);

  const program_objs = _.map( get_program_objs(), obj => new Program(obj) );
  return await Program.insertMany(program_objs);
}

