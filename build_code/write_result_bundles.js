const fs = require("fs");
const cp = require("child_process");
const _ = require("lodash");
const d3_dsv = require('d3-dsv');
const { compute_counts_from_set } = require('../src/models/result_counts.js');

const MOCK_DATA = false;

const {
  sub_program: sub_program_row_to_obj,
  result: result_row_to_obj,
  indicator : indicator_row_to_obj,
  resource_explanation: resource_explanation_row_to_obj,
  indicator_to_row,
  result_to_row,
  sub_program_to_row,
} = require('../src/models/csv_adapters.js');

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
let resource_explanations_by_entity_id = {};


const status_colors = ['success','success','failure', 'not_avail', 'not_appl'];
const status_periods = ['past', 'future','past', 'future','future', 'future', 'other' ];
function populate_stores(file_obj){

  org_store = [];
  crso_by_deptcode = {};
  programs_by_crso_id = {};
  programs_by_tag_id = {};

  resultBySubjId = {};
  indicatorsByResultId = {};
  sub_programs_by_id = {};
  sub_programs_by_parent_id = {}; 
  pi_dr_links_by_program_id = {};
  resource_explanations_by_entity_id = {};

  const rows_by_file = _.mapValues(file_obj, csv_str => _.tail(d3_dsv.csvParseRows(csv_str) ) );

  const {
    depts, 
    crsos, 
    programs, 
    tag_prog_links, 

    sub_programs,
    results, 
    indicators, 
    resource_explanations, 
    PI_DR_links,
  } = rows_by_file;


  _.each(depts, ([ org_id, dept_code ])=> {
    if(dept_code){
      org_store.push({org_id, dept_code}) 
    }
  });

  _.each(crsos, ([ crso_id, dept_code ]) => {
    if(!crso_by_deptcode[dept_code]){
      crso_by_deptcode[dept_code] = [];
    }
    crso_by_deptcode[dept_code].push(crso_id)
  });

  _.each(programs, ([ title,dept_code, activity_code , useless, crso_id])=> {
    const prog_id  = `${dept_code}-${activity_code}`;

    if(!programs_by_crso_id[crso_id]){
      programs_by_crso_id[crso_id] = [];
    }
    programs_by_crso_id[crso_id].push(prog_id);
  });

  _.each(tag_prog_links, ([dept_code, activity_code, tag_id]) => {
    const prog_id  = `${dept_code}-${activity_code}`;

    if(!programs_by_tag_id[tag_id]){
      programs_by_tag_id[tag_id] = [];
    }
    programs_by_tag_id[tag_id].push(prog_id)
    
  });

  _.each(sub_programs, row => {
    const obj = sub_program_row_to_obj(row);

    //MOCK DATA
    if(MOCK_DATA){
      obj.spend_pa_last_year = obj.spend_planning_year_1;
      obj.fte_pa_last_year = obj.fte_planning_year_1;
      obj.planned_spend_pa_last_year = obj.spend_planning_year_1;
      obj.planned_fte_pa_last_year = obj.fte_planning_year_1;
    }

    const { id, parentID } = obj;

    const record = { 
      id, 
      parentID,
      row,
      obj,
    };
    sub_programs_by_id[id] = record;

    if(!sub_programs_by_parent_id[parentID]){
      sub_programs_by_parent_id[parentID] = []
    }
    sub_programs_by_parent_id[parentID].push(record);
  });

  _.chain(results)
    .map(row => result_row_to_obj(row))
    .map(obj => {
      const { id } = obj;

      if(MOCK_DATA){
        const dp_obj = Object.assign({},obj, { doc: 'dp17' } );
        const drr_obj = Object.assign({},obj, {
          id: id+"_1", 
          doc: 'drr16',
        });
        return [ dp_obj, drr_obj ];
      } else {

        return [obj];
      }
    
    })
    .flatten()
    .each(obj => {
    
      const { subject_id } = obj;
      if(!resultBySubjId[subject_id]){
        resultBySubjId[subject_id] = [];
      }
      resultBySubjId[subject_id].push(obj);

    })
    .value() //value must be called in order for chain call to exec

  //TODO: once we have not-met/met etc. 
  _.chain(indicators)
    .map(row => indicator_row_to_obj(row) )
    .map(obj =>  {
      const { id, result_id, planned_target_str } = obj;

      if(MOCK_DATA){

        const dp_obj = Object.assign({}, obj,{ doc: 'dp17' })

        const status_color = _.sample(status_colors);
        const status_period = _.sample(status_periods);
        const status_key = `${status_period}_${status_color}`;

        const drr_obj = Object.assign({}, obj,{ 
          id: id+"_1", 
          result_id: result_id+"_1" , 
          doc: 'drr16',
          actual_target_str: planned_target_str,
          status_color,
          status_period,
          status_key,
        });
        return [ dp_obj, drr_obj ];

      } else {

        //if(obj.doc === 'dp17'){
          return [ obj ];
        //} else {
        //  //FIXME periods aren't working yet. Here's a hack
        //  return [
        //    Object.assign({},obj, { 
        //      status_period: _.sample(status_periods),
        //    }) 
        //  ];
        //}
      }  
    })
    .flatten()
    .each(obj => {
      const { result_id } = obj;
      if(!indicatorsByResultId[result_id]){
        indicatorsByResultId[result_id] = [];
      }
      indicatorsByResultId[result_id].push(obj);
    })
    .value() //value must be called in order for chain call to exec

  _.each(PI_DR_links, row => {
    const [ program_id, dr_id ] = row;
    if(!pi_dr_links_by_program_id[program_id]){
      pi_dr_links_by_program_id[program_id] = [];
    }
    pi_dr_links_by_program_id[program_id].push(row);
  });

  _.each(resource_explanations, row => {
    const { id } = row;
    if(!resource_explanations_by_entity_id[id]){
      resource_explanations_by_entity_id[id] = [];
    }
    resource_explanations_by_entity_id[id].push(row);
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

  const resource_explanations = _.chain(entity_ids)
    .map(id => resource_explanations_by_entity_id[id] )
    .flatten()
    .compact()
    .value();

  return {
    resource_explanations,
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

  const resource_explanations = _.chain(entity_ids)
    .map(id => resource_explanations_by_entity_id[id] )
    .flatten()
    .compact()
    .value();

  return {
    resource_explanations,
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
    resource_explanations: (
      _.chain(resource_explanations_by_entity_id)
        .map(_.identity)
        .flatten()
        .compact()
        .value()
    ),
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

function write_result_bundles(file_obj, dir, lang){
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
    dir,
    lang
  );

  write_summary_bundle(data_by_dept, data_by_tag, all_data, dir);
  

}


function data_to_str(obj, key){
  return _.chain(obj)
    .pipe(obj => Object.assign({}, obj, {
      results: _.map(obj.results, result_to_row ),
      indicators: _.map(obj.indicators, indicator_to_row ),
      sub_programs: _.map(obj.sub_programs, sub_program_to_row),
    }))
    .mapValues( (rows, key) => {
      return d3_dsv.csvFormatRows(rows) 
    })
    .pipe( obj => JSON.stringify(obj) )
    .value()
}

function write_result_bundles_from_data(obj, dir, lang){
  _.each(obj, (data, key) =>  {
    const file_name = `${dir}/results_bundle_${lang}_${key}.html`;
    const compressed_file_name = `${dir}/results_bundle_${lang}_${key}_min.html`;

    fs.writeFileSync(file_name, data_to_str(data,key) ) 
    cp.execSync(`gzip -c ${file_name} > ${compressed_file_name}`);

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
