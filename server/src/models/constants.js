import _ from 'lodash';

export const public_account_years = [
  "pa_last_year_5",
  "pa_last_year_4",
  "pa_last_year_3",
  "pa_last_year_2",
  "pa_last_year",
];

export const planning_years = [
  "planning_year_1",
  "planning_year_2",
  "planning_year_3",
];

export const people_years = [
  "ppl_last_year_5",
  "ppl_last_year_4",
  "ppl_last_year_3",
  "ppl_last_year_2",
  "ppl_last_year",
];

export const public_account_years_auth_exp = _.flatMap(public_account_years, year => [ `${year}_auth`, `${year}_exp` ]);

export const auth_exp_year_to_pa_year = year_with_suffix => {
  if(_.endsWith(year_with_suffix, "_auth")){
    return year_with_suffix.split("_auth")[0];
  } else if(_.endsWith(year_with_suffix, "_exp")){
    return year_with_suffix.split("_exp")[0];
  }
  else {
    //throw an error? 
    return year_with_suffix;
  }
}

export const estimates_years = [
  "est_last_year_3",
  "est_last_year_2",
  "est_last_year",
  "est_in_year",
];


export const previous_year = year => {
  if(_.includes(public_account_years, year)){
    const index = _.indexOf(public_account_years, year);
    if(index > 0){
      return public_account_years[index-1];
    } else {
      return null;
    }
  }
}