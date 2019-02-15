import _ from "lodash";
import { get_standard_csv_file_rows } from '../load_utils.js';

export default function({models}){

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
  });

  _.each(indicator_records, obj => {
    const { 
      target_year, 
      target_month,

      status_color, 
      status_period, 
    } = obj;

    obj.target_year = _.isNaN(parseInt(target_year)) ? null : parseInt(target_year);
    obj.target_month= _.isEmpty(target_month) ? null : +target_month;
    obj.status_key = status_period && `${status_period}_${status_color}`;
  });


  const {
    SubProgram,
    Result,
    Indicator,
    PI_DR_Links,
  } = models;

  _.each(sub_program_records, sub => SubProgram.register(sub));
  _.each(result_records, res => Result.register(res));
  _.each(indicator_records, ind => Indicator.register(ind));
  _.each(pi_dr_links, ({program_id, result_id}) => PI_DR_Links.add(program_id, result_id) );
}
