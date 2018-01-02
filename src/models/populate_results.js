const {
  sub_program: sub_program_row_to_obj,
  result: result_row_to_obj,
  indicator : indicator_row_to_obj,
} = require('./csv_adapters.js');
  
const {
  Indicator, 
  Result, 
  SubProgramEntity,
  PI_DR_Links,
  ResultCounts,
} = require('./results.js');

const { fetch_and_inflate } =require('../core/utils.js');


let _loaded_dept_or_tag_codes = {};

export function load_results_bundle(subject){
  
  let subject_code;
  if(subject){
    switch(subject.level){
      case 'dept':
        subject_code = subject.acronym;
        break;
      case 'program':
        subject_code = subject.dept.acronym;
        break;
      case 'crso':
        subject_code = subject.dept.acronym;
        break;
      case 'tag':
        subject_code = subject.id;
        break;
      default:
        subject_code = 'all';
        break;
    }
  } else {
    subject_code = 'all';
  }

  if(_loaded_dept_or_tag_codes[subject_code] || _loaded_dept_or_tag_codes['all']){
    return $.Deferred().resolve();
  }

  const { lang } = window;

  return (
    window.binary_download && !window.isIE() ? 
    fetch_and_inflate(`results/results_bundle_${lang}_${subject_code}_min.html`)
      .then( inflated_resp => {
        populate_results_info(JSON.parse(inflated_resp));
      }) :
    $.ajax({url : `results/results_bundle_${lang}_${subject_code}.html` })
      .then(response => {
        populate_results_info(JSON.parse(response));
      })
  ).then( ()=> {
    _loaded_dept_or_tag_codes[subject_code] = true;
  })
     

}

let is_results_count_loaded = false;
export function load_results_counts(){
  if(is_results_count_loaded){
    return $.Deferred().resolve();

  } else {
    return $.ajax({url : `results/results_summary.html` })
      .then(response => {
        const rows = d4.csvParse(response);
        _.each(rows, row => {
          _.each(row, (val,key) => {
            if(!_.isNaN(+val)){
              row[key] = +val;
            }
          });
        });
        ResultCounts.set_data(rows); 
        is_results_count_loaded = true;
      });
  }
  
}

function populate_results_info(data){
  //most of the results data is csv-row based, without headers.
  _.each(['results', 'indicators', 'pi_dr_links', 'sub_programs'], key => {
    data[key] = d4.csvParseRows(data[key]);
  })

  const {
    results,
    sub_programs,
    indicators,
    pi_dr_links,
  } = data;

  _.each(sub_programs, csv_row => SubProgramEntity.create_and_register(sub_program_row_to_obj(csv_row)) );

  _.each(results, csv_row => Result.create_and_register(result_row_to_obj(csv_row)) );

  _.each(indicators, csv_row => Indicator.create_and_register(indicator_row_to_obj(csv_row)) )

  _.each(pi_dr_links, csv_row => PI_DR_Links.add(csv_row[0], csv_row[1]) );

}