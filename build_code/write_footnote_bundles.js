const _ = require("lodash");
const d3_dsv = require('d3-dsv');

const {
  footnote: footnote_row_to_obj,
  footnote_to_row,
} = require('../src/models/csv_adapters.js');

// models/results has no dependencies 
let 
  all_footnotes, 
  crso_deptcodes,
  program_deptcodes,
  program_tag_ids,

  global_footnotes,
  footnotes_by_deptcode,
  footnotes_by_tag_id;




function populate_stores(file_obj){

  //initialize (or reset) the stores
  all_footnotes = [];
  crso_deptcodes = {};
  program_deptcodes = {};
  program_tag_ids = {};

  global_footnotes = [];

  const rows_by_file = _.chain(file_obj)
    .mapValues( csv_str => _.tail(d3_dsv.csvParseRows(_.trim(csv_str) ) ) )
    .value();

  const {
    depts,
    crsos, 
    programs, 
    tag_prog_links, 

    footnotes,
  } = rows_by_file;

  _.each(crsos, ([ crso_id, dept_code ]) => {
    crso_deptcodes[crso_id] = dept_code;
  });

  _.each(programs, ([ title,dept_code, activity_code , useless, crso_id])=> {
    const prog_id  = `${dept_code}-${activity_code}`;
    program_deptcodes[prog_id] = dept_code;
  });

  _.each(tag_prog_links, ([dept_code, activity_code, tag_id]) => {
    const prog_id  = `${dept_code}-${activity_code}`;

    if(!program_tag_ids[prog_id]){
      program_tag_ids[prog_id] = [];
    }
    program_tag_ids[prog_id].push(tag_id)
    
  });

  //initialize all depts and tags to have empty array of footnotes 
  footnotes_by_deptcode = _.chain(depts)
    .map( ([org_id, dept_code]) => [dept_code, [] ] )
    .fromPairs()
    .value();

  footnotes_by_tag_id = _.chain(program_tag_ids)
    .map() //to array
    .flatten()
    .uniq()
    .map( tag_id => [tag_id, [] ] )
    .fromPairs()
    .value();

  _.each(footnotes, row => {
    //FIXME: once pipeline starts including unique IDs for each footnote, we can stop using index.
    const obj = footnote_row_to_obj(row);
    all_footnotes.push(obj);

    const {
      level_name,
      subject_id,
    } = obj;

    if(level_name==="gov" || subject_id === "*"){
      global_footnotes.push(obj);

    } else {

      switch(level_name){
        case 'dept': {
          const dept_code = subject_id; 
          footnotes_by_deptcode[dept_code].push(obj);
          break;
        }
    
        case 'program': {
          const dept_code = program_deptcodes[subject_id];
          footnotes_by_deptcode[dept_code].push(obj);

          const tag_ids = program_tag_ids[subject_id];
          _.each(tag_ids, tag_id => {
            footnotes_by_tag_id[tag_id].push(obj);
          });

          
          break;
        }

        case 'crso': {
          const dept_code = crso_deptcodes[subject_id];
          footnotes_by_deptcode[dept_code].push(obj);

          break;
        }

        case 'tag': {
          const tag_id = subject_id;
          footnotes_by_tag_id[tag_id].push(obj);

          break;
        }
      

      }

    }
     
  });

}

function footnotes_to_csv_string(footnote_objs){
  return d3_dsv.csvFormatRows(
    _.map(footnote_objs, footnote_to_row )
  );
}

function get_footnote_file_defs(file_obj){
  populate_stores(file_obj);

  return {
    depts: _.chain(footnotes_by_deptcode)
      .mapValues(footnotes_to_csv_string)
      .value(),
    tags: _.chain(footnotes_by_tag_id)
      .mapValues(footnotes_to_csv_string)
      .value(),
    global: footnotes_to_csv_string(global_footnotes),
    all: footnotes_to_csv_string(all_footnotes),
  };


}


module.exports = exports = { get_footnote_file_defs };
