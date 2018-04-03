import { get_static_url } from '../core/static_url';

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
    fetch_and_inflate( get_static_url(`results/results_bundle_${lang}_${subject_code}_min.html`))
      .then( inflated_resp => {
        populate_results_info(JSON.parse(inflated_resp));
      }) :
    $.ajax({
      url : get_static_url(`results/results_bundle_${lang}_${subject_code}.html`),
    })
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
    return $.ajax({
      url : get_static_url(`results/results_summary.html`),
    })
      .then(response => {
        const rows = d3.csvParse(response);
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
    data[key] = d3.csvParse(data[key]);
  })

  const {
    results,
    sub_programs,
    indicators,
    pi_dr_links,
  } = data;

  _.each(sub_programs, obj => {

    _.each([
      "spend_planning_year_1",
      "spend_planning_year_2",
      "spend_planning_year_3",
      "fte_planning_year_1",
      "fte_planning_year_2",
      "fte_planning_year_3",
      "spend_pa_last_year",
      "fte_pa_last_year",
      "planned_spend_pa_last_year",
      "planned_fte_pa_last_year",
    ], key => {
      obj[key] = _.isNaN(obj[key]) ? null : +obj[key];
    });

    SubProgramEntity.create_and_register(obj);
  });

  _.each(results, obj => {
    obj.is_efficiency = obj.is_efficiency === "1";
    
    Result.create_and_register(obj);
  });

  _.each(indicators, obj => {
    
    const { target_year, target_month, status_color, status_period } = obj;
    
    obj.target_year = _.isNaN(parseInt(target_year)) ? null : parseInt(target_year);
    obj.target_month= _.isEmpty(target_month) ? null : +target_month;
    obj.status_key = status_period && `${status_period}_${status_color}`;

    Indicator.create_and_register(obj);
  })

  _.each(pi_dr_links, ({program_id, result_id}) => PI_DR_Links.add(program_id, result_id) );

}