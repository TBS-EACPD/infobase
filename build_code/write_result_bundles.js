const fs = require("fs");
const cp = require("child_process");
const _ = require("lodash");
const d3_dsv = require('d3-dsv');
const { compute_counts_from_set } = require('../src/models/result_counts.js');

_.mixin({pipe: (obj, func)=> func(obj) });

// models/results has no dependencies 
let org_store = [];
let crso_by_deptcode = {};
let programs_by_crso_id = {};
let programs_by_tag_id = {};

let resultBySubjId = {};
let indicatorsByResultId = {};
let sub_programs_by_id = {};
let sub_programs_by_parent_id = {}; 
let pi_dr_links_by_program_id = {};


const status_colors = ['success','success','failure', 'not_avail', 'not_appl'];
const status_periods = ['past', 'future','past', 'future','future', 'future', 'other' ];
function populate_stores(parsed_models){

  org_store = [];
  crso_by_deptcode = {};
  programs_by_crso_id = {};
  programs_by_tag_id = {};

  resultBySubjId = {};
  indicatorsByResultId = {};
  sub_programs_by_id = {};
  sub_programs_by_parent_id = {}; 
  pi_dr_links_by_program_id = {};


  const {
    depts, 
    crsos, 
    programs, 
    tag_prog_links, 

    sub_programs,
    results, 
    indicators, 
    PI_DR_links,
  } = parsed_models;


  _.each(depts, ({org_id, dept_code})=> {
    if(dept_code){
      org_store.push({org_id, dept_code}) 
    }
  });

  _.each(crsos, ({id, dept_code}) => {
    if(!crso_by_deptcode[dept_code]){
      crso_by_deptcode[dept_code] = [];
    }
    crso_by_deptcode[dept_code].push(id)
  });

  _.each(programs, ({ dept_code, activity_code, crso_id })=> {
    const prog_id  = `${dept_code}-${activity_code}`;

    if(!programs_by_crso_id[crso_id]){
      programs_by_crso_id[crso_id] = [];
    }
    programs_by_crso_id[crso_id].push(prog_id);
  });

  _.each(tag_prog_links, ({program_id, tag_id}) => {

    if(!programs_by_tag_id[tag_id]){
      programs_by_tag_id[tag_id] = [];
    }
    programs_by_tag_id[tag_id].push(program_id)
    
  });


  _.each(sub_programs, obj => {
    const { id, parent_id } = obj;

    const record = { 
      id, 
      parent_id,
      obj,
    };
    sub_programs_by_id[id] = record;

    if(!sub_programs_by_parent_id[parent_id]){
      sub_programs_by_parent_id[parent_id] = []
    }
    sub_programs_by_parent_id[parent_id].push(record);
  });

  _.each(results, obj => {
    const { subject_id } = obj;
    if(!resultBySubjId[subject_id]){
      resultBySubjId[subject_id] = [];
    }
    resultBySubjId[subject_id].push(obj);

  });

  //TODO: once we have not-met/met etc. 
  _.each(indicators, obj => {
      const { result_id } = obj;
      if(!indicatorsByResultId[result_id]){
        indicatorsByResultId[result_id] = [];
      }
      indicatorsByResultId[result_id].push(obj);
      obj.status_key = obj.status_period && `${obj.status_period}_${obj.status_color}`;
    })

  _.each(PI_DR_links, obj => {
    const { program_id } = obj;
    if(!pi_dr_links_by_program_id[program_id]){
      pi_dr_links_by_program_id[program_id] = [];
    }
    pi_dr_links_by_program_id[program_id].push(obj);
  });

}



function dept_result_data(dept_code){
  const crsos = crso_by_deptcode[dept_code] || [];
  const programs = _.chain(crsos)
    .map(id => programs_by_crso_id[id] )
    .flatten()
    .compact()
    .value();

  const sub_programs = _.chain(programs)
    .map(id => sub_programs_by_parent_id[id] )
    .flatten()
    .compact()
    .value();

  const sub_subs = _.chain(sub_programs)
    .map( ({id}) => sub_programs_by_parent_id[id] )
    .flatten()
    .compact()
    .value();

  const entity_ids = [
    dept_code,
    ...crsos,
    ...programs,
    ..._.map(sub_programs, 'id'),
    ..._.map(sub_subs, 'id'),
  ];

  const results = _.chain(entity_ids)
    .map(id => resultBySubjId[id] )
    .flatten()
    .compact()
    .value();

  const indicators = _.chain(results)
    .map( ({id}) => indicatorsByResultId[id] )
    .flatten()
    .compact()
    .value();

  const pi_dr_links = _.chain(programs)
    .map( id => pi_dr_links_by_program_id[id] )
    .flatten()
    .compact()
    .value()


  return {
    pi_dr_links,
    results,
    indicators,
    sub_programs: _.map([
      ...sub_programs,
      ...sub_subs,
    ], 
    'obj'),
  };

}

function tag_result_data(tag_id){
  const programs = programs_by_tag_id[tag_id];

  const sub_programs = _.chain(programs)
    .map(id => sub_programs_by_parent_id[id] )
    .flatten()
    .compact()
    .value();

  const sub_subs = _.chain(sub_programs)
    .map( ({id}) => sub_programs_by_parent_id[id] )
    .flatten()
    .compact()
    .value();

  const entity_ids = [
    ...programs,
    ..._.map(sub_programs, 'id'),
    ..._.map(sub_subs, 'id'),
  ];

  const results = _.chain(entity_ids)
    .map(id => resultBySubjId[id] )
    .flatten()
    .compact()
    .value();

  const indicators = _.chain(results)
    .map( ({id}) => indicatorsByResultId[id] )
    .flatten()
    .compact()
    .value();

  const pi_dr_links = _.chain(programs)
    .map( id => pi_dr_links_by_program_id[id] )
    .flatten()
    .compact()
    .value()

  return {
    pi_dr_links,
    results,
    indicators,
    sub_programs: _.map([
      ...sub_programs,
      ...sub_subs,
    ], 'obj'),
  };

}

function get_all_data(){
  return {
    pi_dr_links: (
      _.chain(pi_dr_links_by_program_id)
        .map(_.identity)
        .flatten()
        .compact()
        .value()
    ),
    results: (
      _.chain(resultBySubjId)
        .map(_.identity)
        .flatten()
        .compact()
        .value()
    ),
    indicators : (
      _.chain(indicatorsByResultId)
        .map(_.identity)
        .flatten()
        .compact()
        .value()
    ),
    sub_programs: (
      _.chain(sub_programs_by_id)
        .map(_.identity)
        .map('obj')
        .compact()
        .value()
    ),
  };

}

function write_result_bundles(file_obj, dir){
  populate_stores(file_obj);
 
  const data_by_dept = _.chain(org_store)
    .map( ({dept_code}) => [ dept_code, dept_result_data(dept_code) ])
    .fromPairs()
    .value();

  const data_by_tag = _.chain(programs_by_tag_id)
    .keys()
    .map( tag_id => [tag_id, tag_result_data(tag_id) ] )
    .fromPairs()
    .value();

  const all_data =  get_all_data();

  write_result_bundles_from_data(
    Object.assign(
      {
        all: all_data,
      },
      data_by_tag, 
      data_by_dept 
    ), 
    dir
  );

  write_summary_bundle(data_by_dept, data_by_tag, all_data, dir);
  

}


const unilingual_keys_by_model = {
  results: ["name"],
  indicators: ["name","explanation","target_narrative","actual_result"],
  sub_program : [
    "name",
    "description",
    "dp_no_spending_expl",
    "dp_spend_trend_expl",
    "dp_no_fte_expl",
    "dp_fte_trend_expl",
    "drr_spend_expl",
    "drr_fte_expl",
  ],
};


function data_to_str(obj, lang){
  const other_lang = lang === "en" ? "fr" : "en";

  return _.chain(obj)
    .mapValues( (rows, key) => {
      const unilingual_keys = unilingual_keys_by_model[key] || [];
      
      const transformed_rows = _.map(rows, obj => {

        const new_obj = _.clone(obj);

        _.each(unilingual_keys, key => {

          new_obj[key] = new_obj[`${key}_${lang}`];
          delete new_obj[`${key}_${lang}`];
          delete new_obj[`${key}_${other_lang}`];

        });

        return new_obj;

      });

      return d3_dsv.csvFormat(transformed_rows) 
      
    })
    .pipe( obj => JSON.stringify(obj) )
    .value()
}

function write_result_bundles_from_data(obj, dir){
  _.each(obj, (data, key) =>  {

    _.each(["en","fr"], lang => {



      const file_name = `${dir}/results_bundle_${lang}_${key}.html`;
      const compressed_file_name = `${dir}/results_bundle_${lang}_${key}_min.html`;
  
      fs.writeFileSync(file_name, data_to_str(data,lang) ) 
      cp.execSync(`gzip -c ${file_name} > ${compressed_file_name}`);
    })
    

  })


}

function write_summary_bundle(data_by_dept, data_by_tag, all_data, dir){

  const counts_for_dept = _.map(data_by_dept, (data, dept_code) => Object.assign({id: dept_code, level: 'dept' }, compute_counts_from_set(data) ) );
  const counts_for_tag = _.map(data_by_tag, (data, tag_id) => Object.assign({id: tag_id, level: 'tag' }, compute_counts_from_set(data) ) );
  const total_counts = Object.assign({ id: 'total', level: 'all' }, compute_counts_from_set(all_data) )
  

  const csv = d3_dsv.csvFormat([...counts_for_dept, ...counts_for_tag, total_counts ]);

  const file_name = `${dir}/results_summary.html`; 
  fs.writeFileSync(file_name, csv);
  
}

module.exports = exports = { write_result_bundles };
