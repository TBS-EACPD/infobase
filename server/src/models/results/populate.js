import _ from "lodash";
import { get_standard_csv_file_rows } from '../load_utils.js';

export default async function({models}){
  const { SubProgram, Result, Indicator, PIDRLink } = models


  const sub_program_records = get_standard_csv_file_rows("subprograms.csv");

  const result_records = get_standard_csv_file_rows("Results.csv");

  const indicator_records = get_standard_csv_file_rows("Indicators.csv");

  const pi_dr_links = get_standard_csv_file_rows("pi_dr_links.csv");
  

  _.each(sub_program_records, obj => {
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
    obj.sub_program_id = obj.id;
    obj.id = null;
  });
    
  _.each(result_records, obj => {
    obj.result_id = obj.id;
    obj.id = null;
  });

  _.each(indicator_records, obj => {
    const { 
      target_year, 
      target_month,

      status_color, 
      status_period, 
    } = obj;

    obj.indicator_id = obj.id;
    obj.id = null;
    obj.target_year = _.isNaN(parseInt(target_year)) ? null : parseInt(target_year);
    obj.target_month= _.isEmpty(target_month) ? null : +target_month;
    if(!obj.status_key){
      obj.status_key = "dp";
    }
  });


  await SubProgram.insertMany(sub_program_records);
  await Result.insertMany(result_records)
  await Indicator.insertMany(indicator_records);
  return await PIDRLink.insertMany(pi_dr_links);
}
