import _ from 'lodash';
import { public_account_years, planning_years } from '../constants';
import { expenditure_cols, fte_cols } from './constants';


const schema = `


  interface SubjectWithBasicResources {
    program_spending_data: ProgramSpendingData
    program_fte_data: ProgramFteData
  }
  extend type Org implements SubjectWithBasicResources { 
    program_spending_data: ProgramSpendingData
    program_fte_data: ProgramFteData
  }
  extend type Program implements SubjectWithBasicResources {
    program_spending_data: ProgramSpendingData
    program_fte_data: ProgramFteData
  }
  extend type Gov implements SubjectWithBasicResources {
    program_spending_data: ProgramSpendingData
    program_fte_data: ProgramFteData
  }


  type ProgramSpendingData {
    basic_spend_trend: BasicSpendTrend
    totals: [ProgramSpendingRecord]
  }

  type BasicSpendTrend {
    
    pa_last_year_auth: Float
    pa_last_year_exp: Float
    pa_last_year_2_auth: Float
    pa_last_year_2_exp: Float
    pa_last_year_3_auth: Float
    pa_last_year_3_exp: Float
    pa_last_year_4_auth: Float
    pa_last_year_4_exp: Float
    pa_last_year_5_auth: Float
    pa_last_year_5_exp: Float
    pa_last_year_planned: Float
  
    planning_year_1: Float
    planning_year_2: Float
    planning_year_3: Float
    

    avg_historical: Float
    avg_planned: Float
    avg_all: Float

    historical_change_pct: Float
    planned_change_pct: Float
  }

  type ProgramSpendingRecord {
    amount: Float
    year: String
  }

  type ProgramFteData {
    basic_fte_trend: BasicFteTrend
    totals: [ProgramFteRecord]
  }

  type BasicFteTrend {
    pa_last_year_5: Float
    pa_last_year_4: Float
    pa_last_year_3: Float
    pa_last_year_2: Float
    pa_last_year: Float
    planning_year_1: Float
    planning_year_2: Float
    planning_year_3: Float
    
    
    
    avg_historical: Float
    avg_planned: Float
    avg_all: Float

    historical_change_pct: Float
    planned_change_pct: Float
  }

  type ProgramFteRecord {
    amount: Float
    year: String
  }
`;


export default function({models}){

  const { 
    ProgramSpending,
    ProgramFte,
  } = models;


  function get_basic_spend_trend({totals, subject}){
    
    const exp_totals_obj = _.chain(totals)
      .map( ({ year, amount }) => [ year, amount ] )
      .fromPairs()
      .value();

    const avg_all = _.chain(expenditure_cols).map(key => exp_totals_obj[key] || 0)
      .sum()
      .value()/8;

    const avg_historical = _.chain([
      "pa_last_year_exp",
      "pa_last_year_2_exp",
      "pa_last_year_3_exp",
      "pa_last_year_4_exp",
      "pa_last_year_5_exp",
    ]).map(key => exp_totals_obj[key] || 0)
      .sum()
      .value()/5;

    const avg_planned = _.chain([
      "planning_year_1",
      "planning_year_2",
      "planning_year_3",
    ]).map(key => exp_totals_obj[key] || 0)
      .sum()
      .value()/3;

    const historical_change_pct = (exp_totals_obj.pa_last_year_exp - exp_totals_obj.pa_last_year_5_exp)/exp_totals_obj.pa_last_year_5_exp;
    const planned_change_pct = (exp_totals_obj.planning_year_3 - exp_totals_obj.pa_last_year_exp)/exp_totals_obj.pa_last_year_exp;

    return {
      ...exp_totals_obj,
      historical_change_pct,
      planned_change_pct,
      avg_planned,
      avg_historical,
      avg_all,
    };
  };



  function get_basic_fte_trend({ subject, totals }){

    const fte_totals_obj = _.chain(totals)
      .map( ({ year, amount }) => [ year, amount ] )
      .fromPairs()
      .value();

    const avg_all = _.chain(fte_cols).map(key => fte_totals_obj[key] || 0)
      .sum()
      .value()/8;

    const avg_historical = _.chain(public_account_years).map(key => fte_totals_obj[key] || 0)
      .sum()
      .value()/5;

    const avg_planned = _.chain(planning_years).map(key => fte_totals_obj[key] || 0)
      .sum()
      .value()/3;

    const historical_change_pct = (fte_totals_obj.pa_last_year - fte_totals_obj.pa_last_year_5)/fte_totals_obj.pa_last_year_5;
    const planned_change_pct = (fte_totals_obj.planning_year_3 - fte_totals_obj.pa_last_year)/fte_totals_obj.pa_last_year;

    return {
      ...fte_totals_obj,
      historical_change_pct,
      planned_change_pct,
      avg_planned,
      avg_historical,
      avg_all,
    };
  };


  function programSpendingDataResolver(subject){
    const totals = ProgramSpending.get_totals(subject);
    return { totals, subject };
  };

  function programFteDataResolver(subject){
    const totals= ProgramFte.get_totals(subject);
    return { totals, subject };
  };

  const subject_resolvers = {
    program_spending_data: programSpendingDataResolver,
    program_fte_data: programFteDataResolver,
  };

  const resolvers = {
    Program: subject_resolvers,
    Org: subject_resolvers,
    Gov: subject_resolvers,
    ProgramSpendingData: {
      basic_spend_trend: get_basic_spend_trend,
      totals: _.property('totals'),
    },
    ProgramFteData: {
      basic_fte_trend: get_basic_fte_trend,
      totals: _.property('totals'),
    },
  };

  return {
    schema,
    resolvers,
  };
}
