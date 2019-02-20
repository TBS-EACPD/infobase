import _ from 'lodash';
import { 
  bilingual_field,
} from '../schema_utils';

const schema = `
  type ResultCount {
    results: Int

    dp: Int
    
    met: Int 
    not_available: Int
    not_met: Int
    future: Int
  }

  extend type Gov {
    target_counts(doc:String): ResultCount
  }

  extend type Org {
    target_counts(doc:String): ResultCount
  }

  extend type Crso {
    target_counts(doc:String): ResultCount
    results(doc:String): [Result]
  }

  extend type Program{
    target_counts(doc:String): ResultCount
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
    Org,
    Crso,
    Program,
    SubProgram,
    Result,
    Indicator,
    PIDRLink,
  } = models;

  const {
    prog_dept_code_loader,
    crso_from_deptcode_loader,
    
    result_by_subj_loader,
    indicator_by_result_loader,
    program_link_loader,
    sub_program_loader,
  } = loaders;


  //this should take 6 DB queries, but the first 2 can be done in paralel
  const result_count_defaults = {
    results: 0,
    
    dp: 0,

    not_met: 0,
    not_available: 0,
    met: 0,
    future: 0,
  };

  async function get_gov_target_counts(doc){
    const orgs = await Org.find({});

    const all_counts = await Promise.all(
      _.chain(orgs)
        .filter("dept_code")
        .map(async org => await get_org_target_counts(org, doc) )
        .value()
    );

    return _.reduce(
      all_counts,
      (memo, counts) => _.mapValues(
        memo,
        (memo_value, key) => memo_value + counts[key]
      ),
      result_count_defaults
    );
  }

  async function get_org_target_counts(org, doc){
    const [crsos, progs] = await Promise.all([
      crso_from_deptcode_loader.load(org.dept_code),
      prog_dept_code_loader.load(org.dept_code),
    ]);

    return await get_target_counts(
      [ 
        ..._.map(crsos, 'crso_id'), 
        ..._.map(progs, 'program_id'),
      ],
      doc
    );
  }

  async function get_target_counts(cr_or_program_ids, doc){
    
    // turns [ [ { [attr]: val, ... }, undef ... ], undef ... ] into [ val, ... ] w/out undefs 
    const flatmap_to_attr = (list_of_lists, attr) => _.chain(list_of_lists)
      .compact()
      .flatten()
      .map(attr)
      .compact()
      .value();

    const sub_programs = await sub_program_loader.loadMany(cr_or_program_ids);
    const sub_subs = await sub_program_loader.loadMany(flatmap_to_attr(sub_programs, 'sub_program_id'));
    
    const results = await result_by_subj_loader.loadMany([
      ...cr_or_program_ids,
      ...flatmap_to_attr(sub_programs, 'sub_program_id'),
      ...flatmap_to_attr(sub_subs, 'sub_program_id'),
    ]);

    const all_indicators = await indicator_by_result_loader.loadMany(flatmap_to_attr(results,'result_id'))

    const doc_indicators = _.chain(all_indicators)
      .flatten()
      .filter({doc})
      .value();

    return _.defaults({
      ..._.countBy(doc_indicators, 'status_key'),
      results: _.chain(results).compact().flatten().filter({doc}).value().length,
    }, result_count_defaults);
  }

  async function get_results(subject, { include_efficiency, doc }){
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
    let records = await result_by_subj_loader.load(id_val);

    if(doc){
      records = _.filter(records, {doc});
    }
    return records;
  }


  const resolvers = {
    Gov: {
      target_counts: (_x, {doc}) => get_gov_target_counts(doc),
    },
    Org: {
      target_counts: (org, {doc}) => get_org_target_counts(org, doc),
    },
    Crso: {
      results: get_results,
      target_counts: ({crso_id}, {doc}) => get_target_counts([crso_id], doc),
    },
    Program: {
      results: get_results,
      sub_programs: ({program_id}) => sub_program_loader.load(program_id),
      drs: ({program_id}) => program_link_loader.load(program_id),
      target_counts: ({program_id}, {doc}) => get_target_counts([program_id], doc),
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
      id: _.property('result_id'),
      indicators: async (result, {doc} ) => {
        let records = await indicator_by_result_loader.load(result.result_id);
        
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


