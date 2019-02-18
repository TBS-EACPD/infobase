import _ from 'lodash';
import { 
  bilingual_field,
} from '../schema_utils';

const schema = `
  extend type Crso {
    results(doc:String): [Result]
  }

  extend type Program{
    sub_programs: [SubProgram]
    results(doc: String): [Result]
    # special departmental results to which this programs 'contributes' to
    drs: [Result]
    pidrlinks: [PIDRLink]
  }

  type SubProgram {
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
    parent_id: String
    name: String
    doc: String
    indicators(doc: String): [Indicator]
  }

  type Indicator {
    id: String
    result_id: String
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

  # this is a graphql anti-pattern but fits in the existing client stores nicely
  type PIDRLink {
    program_id: String
    result_id: String
  }


`;


export default function({models,loaders}){

  const {
    Crso,
    Program,
    SubProgram,
    Result,
    Indicator,
    PIDRLink,
  } = models;

  const {
    result_by_subj_loader,
    indicator_by_result_loader,
    program_link_loader,
    sub_program_loader,
  } = loaders;

  async function get_results(subject, { doc }){
    const { id } = subject;

    let id_val;
    if(subject instanceof Crso){
      id_val = subject.crso_id;
    } else if(subject instanceof Program){
      id_val = subject.program_id;
    } else if (subject instanceof SubProgram){
      id_val = subject.sub_program_id;
    } else {
      throw "bad subject"
    }
    let records =  await result_by_subj_loader.load(id_val)

    if(doc){
      records = _.filter(records, {doc});
    }
    return records;
  }


  const resolvers = {
    Crso: {
      results: get_results,
    },
    Program: {
      results: get_results,
      sub_programs: ({program_id}) => sub_program_loader.load(program_id),
      drs: ({program_id}) => program_link_loader.load(program_id),
    },
    SubProgram: {
      id: _.property('sub_program_id'),
      sub_programs: ({sub_program_id}) => sub_program_loader.load(sub_program_id),
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
      indicators: (result, {doc} ) => {
        let records = result.indicators;
    
        if(doc){
          records = _.filter(records, {doc});
        }
        return records;
      },
      name: bilingual_field("name"),
    },
    Indicator: {
      id: _.property('indicator_id'),
      name: bilingual_field("name"),
      explanation:bilingual_field("explanation"),
      target_narrative: bilingual_field("target_narrative"),
      actual_result: bilingual_field("actual_result"),
    },
  };

  return { schema, resolvers };
}


