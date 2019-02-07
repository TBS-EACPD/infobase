import _ from "lodash";
import {
  get_standard_csv_file_rows,
  create_program_id,
  bilingual_remap,
} from '../load_utils.js';

export default async function({models}){
  const { Org, Program, Crso } = models;

  const url_lookups = _.keyBy(get_standard_csv_file_rows("url_lookups.csv"), 'id');

  const org_objs = _.chain(get_standard_csv_file_rows("igoc.csv"))
    .map(obj=> ({
      ...obj,
      name_en: obj.applied_title_en || obj.legal_title_en,
      name_fr: obj.applied_title_fr || obj.legal_title_fr,
      ...bilingual_remap(obj, "description", "mandate"),
      ...bilingual_remap(obj, "acronym", "abbr"),
      ...bilingual_remap(url_lookups[obj.dp_url_id], "dp_url", "url"),
      ...bilingual_remap(url_lookups[obj.qfr_url_id], "qfr_url", "url"),
      ...bilingual_remap(url_lookups[obj.eval_url_id], "eval_url", "url"),
    }))
    .map(rec => new Org(rec))
    .value()

  await Org.insertMany(org_objs)

  const crso_objs = _.chain(get_standard_csv_file_rows("crso.csv"))
    .map( obj => ({ 
      ..._.omit(obj, 'id'),
      crso_id: obj.id,
      is_active: obj.is_active === "1",
      ...bilingual_remap(obj, "description", "desc"),
    }))
    .map(obj => new Crso(obj) )
    .value()

  await Crso.insertMany(crso_objs)

  const program_objs = _.chain(get_standard_csv_file_rows("program.csv"))
    .map(obj => ({
      ...obj,
      program_id: create_program_id(obj),
      is_crown: obj.is_crown === "1",
      is_active: obj.is_active === "1",
      is_internal_service: obj.is_internal_service === "1",
      ...bilingual_remap(obj, "description", "desc"),
    }))
    .map(obj => new Program(obj))
    .value()

  return await Program.insertMany(program_objs)


}



export function old({models}){

  const { 
    Org, 
    UrlLookups,
    Program, 
    Crso,
    InstForm,
    Ministry,
    Minister,
  } = models;

  const org_csv_records = get_standard_csv_file_rows("IGOC.csv");
  
  

  const crso_csv_records = get_standard_csv_file_rows("CRSO.csv");
  const program_csv_records = get_standard_csv_file_rows("program.csv");
  
  const url_lookups = _.keyBy(get_standard_csv_file_rows("url_lookups.csv"), 'id');

  const ministries_csv = get_standard_csv_file_rows("ministries.csv");
  const ministers_csv = get_standard_csv_file_rows("ministers.csv");
  const inst_forms_csv = get_standard_csv_file_rows("inst_forms.csv");

  const org_to_minister_csv = get_standard_csv_file_rows("org_to_minister.csv");

  const org_records = org_csv_records.map(obj=> _.assign({
    name_en: obj.applied_title_en || obj.legal_title_en,
    name_fr: obj.applied_title_fr || obj.legal_title_fr,
  }, obj));


  UrlLookups.set_lookups(url_lookups);


  _.each(ministries_csv, obj => Ministry.register(obj) );
  
  _.each(ministers_csv, obj => Minister.register(obj) );

  _.each(inst_forms_csv, record => InstForm.register(record) );

  //once they're all created, create bi-directional parent-children links
  _.each(inst_forms_csv, ({id, parent_id}) => {
    const inst = InstForm.lookup(id);
    if(!_.isEmpty(parent_id)){
      const parent = InstForm.lookup(parent_id);
      parent.children_forms.push(inst)
      inst.parent_form = parent;
    }
  });

  _.each(org_records, org => {
    Org.register(org);

    const inst = Org.get_by_id(org.org_id); 

    const { inst_form_id, ministry_id } = org;
    
    if(!_.isEmpty(ministry_id)){
      const ministry = Ministry.lookup(ministry_id);
      inst.ministry = ministry;
      ministry.orgs.push(inst);
    }

    if(!_.isEmpty(inst_form_id)){
      const inst_form = InstForm.lookup(inst_form_id)
      inst.inst_form = inst_form;
    }
  });

  _.each(org_to_minister_csv, ({ org_id, minister_id })=> {
    const minister = Minister.lookup(minister_id);
    Org.get_by_id(org_id).ministers.push(minister);
  });

  const crso_records = crso_csv_records.map(obj => _.assign({
    is_active: obj.is_active === "1",
  },obj));
  
  const program_records = program_csv_records.map(obj => _.assign(obj, {
    id: create_program_id(obj),
    is_crown: obj.is_crown === "1",
    is_active: obj.is_active === "1",
    is_internal_service: obj.is_internal_service === "1",
  }));

  
  _.each(crso_records,crso => Crso.register(crso));
  _.each(program_records, org => Program.register(org));

}


