import _ from 'lodash';
import { bilingual_field } from '../schema_utils';

const schema = `
  extend type Program implements RppEntity {
    sub_programs: [SubProgram]
    results(doc: String): [Result]
    # special departmental results to which this programs 'contributes' to
    drs: [Result]
  }

  type SubProgram implements RppEntity {
    id: String
    name: String
    description: String
    spend_planning_year_1: Float
    spend_planning_year_2: Float
    spend_planning_year_3: Float
    fte_planning_year_1: Float
    fte_planning_year_2: Float
    fte_planning_year_3: Float

    dp_no_spending_expl: String
    dp_spend_trend_expl: String
    dp_no_fte_expl: String
    dp_fte_trend_expl: String

    spend_pa_last_year: Float
    fte_pa_last_year: Float
    planned_spend_pa_last_year: Float
    planned_fte_pa_last_year: Float

    drr_spend_expl: String
    drr_fte_expl: String

    program: Program
    sub_programs: [SubProgram]
    results(doc: String): [Result]
  }

  type Result {
    id: String
    name: String
    is_efficiency: Boolean
    doc: String
    indicators(doc: String): [Indicator]
  }

  type Indicator {
    id: String
    name: String
    
    target_year: String
    target_month:String
    target_type:String
    target_min:String
    target_max:String
    target_narrative:String
    doc:String

    explanation:String

    actual_result:String
    actual_datatype:String
    actual_result: String
    
    status_color:String
    status_period:String
    status_key:String
  }

  interface RppEntity {
    id: String
    name: String
    results(doc: String): [Result]
    sub_programs: [SubProgram]
  }
`;


export default function({models}){

  const { 
    SubProgram,
    Result,
  } = models;

  function get_results(subject, { include_efficiency, doc }){
    const { id } = subject;

    let records = Result.get_by_parent_id(id);

    if(include_efficiency === false){
      records = _.reject(records, "is_efficiency");
    }
    if(doc){
      records = _.filter(records, {doc});
    }
    return records;
  }

  const resolvers = {
    Program: {
      results: get_results,
      sub_programs: prog => SubProgram.get_by_parent_id(prog.id),
      drs: prog => prog.get_drs(),
    },
    SubProgram: {
      sub_programs: _.property('sub_programs'),
      results: get_results,
      name: bilingual_field("name"),
      description: bilingual_field("description"),

      drr_fte_expl: bilingual_field("drr_fte_expl"),
      drr_spend_expl: bilingual_field("drr_spend_expl"),

      dp_fte_trend_expl: bilingual_field("dp_fte_trend_expl"),
      dp_spend_trend_expl: bilingual_field("dp_spend_trend_expl"),
      dp_no_fte_expl: bilingual_field("dp_no_fte_expl"),
      dp_no_spending_expl: bilingual_field("dp_no_spending_expl"),
    },
    Result: {
      indicators: (result, {doc, include_efficiency} ) => {
        let records = result.indicators;
    
        if(include_efficiency === false){
          records = _.reject(records, "is_efficiency");
        }
        if(doc){
          records = _.filter(records, {doc});
        }
        return records;
      },
      name: bilingual_field("name"),
    },
    Indicator: {
      name: bilingual_field("name"),
      explanation:bilingual_field("explanation"),
      target_narrative: bilingual_field("target_narrative"),
      actual_result: bilingual_field("actual_result"),
    },
  };

  return { schema, resolvers };
}


