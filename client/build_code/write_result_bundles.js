const fs = require("fs");
const _ = require("lodash");
const d3_dsv = require('d3-dsv');
const { compute_counts_from_set } = require('../src/models/result_counts.js');

_.mixin({ pipe: (obj, func) => func(obj) });

let org_store, 
  crso_by_deptcode,
  programs_by_crso_id,
  programs_by_tag_id,
  resultBySubjId,
  indicatorsByResultId,
  sub_programs_by_id,
  sub_programs_by_parent_id,
  pi_dr_links_by_program_id;

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


  _.each(depts, ({org_id, dept_code}) => {
    if(dept_code){
      org_store.push({org_id, dept_code});
    }
  });

  _.each(crsos, ({id, dept_code}) => {
    if(!crso_by_deptcode[dept_code]){
      crso_by_deptcode[dept_code] = [];
    }
    crso_by_deptcode[dept_code].push(id);
  });

  _.each(programs, ({ dept_code, activity_code, crso_id }) => {
    const prog_id = `${dept_code}-${activity_code}`;

    if(!programs_by_crso_id[crso_id]){
      programs_by_crso_id[crso_id] = [];
    }
    programs_by_crso_id[crso_id].push(prog_id);
  });

  _.each(tag_prog_links, ({program_id, tag_id}) => {
    if(!programs_by_tag_id[tag_id]){
      programs_by_tag_id[tag_id] = [];
    }
    programs_by_tag_id[tag_id].push(program_id);
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
      sub_programs_by_parent_id[parent_id] = [];
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

  _.each(indicators, obj => {
    const { result_id } = obj;
    if(!indicatorsByResultId[result_id]){
      indicatorsByResultId[result_id] = [];
    }
    indicatorsByResultId[result_id].push(obj);
  });

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
  const program_ids = _.chain(crsos)
    .map( id => programs_by_crso_id[id] )
    .flatten()
    .compact()
    .value();

  const sub_programs = get_subs_for_parent_ids(program_ids);

  const sub_subs = _.chain(sub_programs)
    .map('id')
    .pipe(get_subs_for_parent_ids)
    .value();

  const entity_ids = _.uniq([
    dept_code,
    ...crsos,
    ...program_ids,
    ..._.map(sub_programs, 'id'),
    ..._.map(sub_subs, 'id'),
  ]);

  const results = _.chain(entity_ids)
    .map( id => resultBySubjId[id] )
    .flatten()
    .compact()
    .value();

  const indicators = _.chain(results)
    .map( ({id}) => indicatorsByResultId[id] )
    .flatten()
    .compact()
    .value();

  const pi_dr_links = _.chain(program_ids)
    .map( id => pi_dr_links_by_program_id[id] )
    .flatten()
    .compact()
    .value();

  return {
    pi_dr_links,
    results,
    indicators,
    sub_programs: [
      ...sub_programs,
      ...sub_subs,
    ],
  };
}

const get_subs_for_parent_ids = parent_ids => _.chain(parent_ids)
  .map(id => sub_programs_by_parent_id[id])
  .flatten()
  .compact()
  .map('obj')
  .compact()
  .value();

function tag_result_data(tag_id){
  const program_ids = programs_by_tag_id[tag_id];

  const sub_programs = get_subs_for_parent_ids(program_ids);

  const sub_subs = _.chain(sub_programs)
    .map('id')
    .pipe(get_subs_for_parent_ids)
    .value();

  const entity_ids = _.uniq([
    ...program_ids,
    ..._.map(sub_programs, 'id'),
    ..._.map(sub_subs, 'id'),
  ]);

  const results = _.chain(entity_ids)
    .map( id => resultBySubjId[id] )
    .flatten()
    .compact()
    .value();

  const indicators = _.chain(results)
    .map( ({id}) => indicatorsByResultId[id] )
    .flatten()
    .compact()
    .value();

  const pi_dr_links = _.chain(program_ids)
    .map( id => pi_dr_links_by_program_id[id] )
    .flatten()
    .compact()
    .value();

  return {
    pi_dr_links,
    results,
    indicators,
    sub_programs: [
      ...sub_programs,
      ...sub_subs,
    ],
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
    indicators: (
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

function data_to_str(obj, lang){
  const unilingual_keys_by_model = {
    results: [
      "name",
    ],
    indicators: [
      "name",
      "explanation",
      "target_narrative",
      "actual_result",
      "methodology",
      "measure",
    ],
    sub_programs: [
      "name",
      "description",
      "drr_spend_expl",
      "drr_fte_expl",
    ],
  };
  
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

      return d3_dsv.csvFormat(transformed_rows);
    })
    .pipe( obj => JSON.stringify(obj) )
    .value();
}

function write_result_bundles_from_data(obj, dir){
  _.each(obj, (data, key) => {
    _.each(["en", "fr"], lang => {
      fs.writeFileSync(
        `${dir}/results_bundle_${lang}_${key}.json.js`, 
        data_to_str(data,lang)
      );
    });
  });
}

function write_summary_bundle(data_by_dept, data_by_tag, all_data, dir){
  const counts_for_dept = _.map( data_by_dept, (data, dept_code) => Object.assign( {id: dept_code, level: 'dept'}, compute_counts_from_set(data) ) );
  const counts_for_tag = _.map( data_by_tag, (data, tag_id) => Object.assign( {id: tag_id, level: 'tag'}, compute_counts_from_set(data) ) );
  const total_counts = Object.assign( {id: 'total', level: 'all'}, compute_counts_from_set(all_data) );
  
  const csv = d3_dsv.csvFormat([...counts_for_dept, ...counts_for_tag, total_counts ]);

  const file_name = `${dir}/results_summary.json.js`; 
  fs.writeFileSync(file_name, csv);
}

function write_granular_summary_bundle(data_by_dept, dir){
  const data_grouped_by_crso_and_program = _.chain(data_by_dept)
    .map(
      ({results, sub_programs}, dept_code) => {
        const crso_ids = crso_by_deptcode[dept_code];
        const subprogram_ids_to_program_ids = _.chain(sub_programs)
          .map(({id, parent_id}) => [id, parent_id])
          .fromPairs()
          .value();

        const grouped_results = _.groupBy(
          results, 
          (result) => _.includes(crso_ids, result.subject_id) ? "crso" : "program"
        );

        const all_crso_data = _.chain(grouped_results.crso)
          .map(
            result => ({
              results: result, 
              indicators: indicatorsByResultId[result.id],
            })
          )
          .groupBy( data => data.results.subject_id )
          .mapValues( 
            crso_data => ({
              results: _.map(crso_data, data => data.results),
              indicators: _.flatMap(crso_data, data => data.indicators),
            })
          )
          .value();
        
        const all_program_data = _.chain(grouped_results.program)
          .map(
            result => ({
              results: result, 
              indicators: indicatorsByResultId[result.id],
            })
          )
          .groupBy( data => subprogram_ids_to_program_ids[subprogram_ids_to_program_ids[data.results.subject_id]] || subprogram_ids_to_program_ids[data.results.subject_id] || data.results.subject_id )
          .mapValues( 
            program_data => ({
              results: _.map(program_data, data => data.results),
              indicators: _.flatMap(program_data, data => data.indicators),
            })
          )
          .value();

        return {
          crso: all_crso_data,
          program: all_program_data,
        };
      }
    )
    .thru( array_of_objects => _.merge(...array_of_objects) )
    .value();

  const counts_for_crso = _.map( data_grouped_by_crso_and_program.crso, (data, crso_id) => Object.assign( {id: crso_id, level: 'crso'}, compute_counts_from_set(data) ) );
  const counts_for_program = _.map( data_grouped_by_crso_and_program.program, (data, program_id) => Object.assign( {id: program_id, level: 'program'}, compute_counts_from_set(data) ) );
  
  const csv = d3_dsv.csvFormat([...counts_for_crso, ...counts_for_program ]);
  const file_name = `${dir}/results_summary_granular.json.js`; 
  fs.writeFileSync(file_name, csv);
}


function write_result_bundles(file_obj, dir){
  populate_stores(file_obj);
 
  const data_by_dept = _.chain(org_store)
    .map( ({dept_code}) => [ dept_code, dept_result_data(dept_code) ])
    .fromPairs()
    .value();

  const data_by_tag = _.chain(programs_by_tag_id)
    .keys()
    .map( tag_id => [ tag_id, tag_result_data(tag_id) ] )
    .fromPairs()
    .value();

  const all_data = get_all_data();

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

  write_granular_summary_bundle(data_by_dept, dir);
}

module.exports = exports = { write_result_bundles };
