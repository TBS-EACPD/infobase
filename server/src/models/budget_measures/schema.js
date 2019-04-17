import _ from "lodash";

import { budget_years } from './budget_measures_common.js';

import { bilingual_field } from '../schema_utils.js';

const schema = `
  type FakeBudgetOrg {
    org_id: String
    level: String
    name: String
    budget_measures(year: Int): [BudgetMeasure]
  }

  extend type Gov {
    fake_budget_orgs: [FakeBudgetOrg]
    all_budget_measures: [BudgetMeasure]
    budget_measure(year: Int, measure_id: String): BudgetMeasure
  }
  extend type Org {
    budget_measures(year: Int): [BudgetMeasure]
  }
  extend type Crso {
    budget_measures(year: Int): [BudgetMeasure]
  }
  extend type Program {
    budget_measures(year: Int): [BudgetMeasure]
  }

  enum ChapterKey {
    adv
    grw
    oth
    prg
    rec
  }
  type BudgetMeasure {
    measure_id: String
    name: String
    chapter_key: ChapterKey
    section_id: String
    desc: String

    data: [BudgetData]
  }
  
  union OrgOrFakeBudgetOrg = Org | FakeBudgetOrg
  type BudgetData {
    unique_id: String

    org_id: String
    org: OrgOrFakeBudgetOrg
    measure_id: String
    measure: BudgetMeasure

    description: String

    funding: Float
    allocated: Float
    remaining: Float
    withheld: Float

    program_allocations: [BudgetProgramAllocation]

    submeasure_breakouts: [BudgetSubmeasure]
  }

  union CrsoOrProgram = Crso | Program
  type BudgetProgramAllocation {
    unique_id: String
    subject_id: String
    subject: CrsoOrProgram

    org_id: String
    org_id: OrgOrFakeBudgetOrg
    measure_id: String
    measure: BudgetMeasure

    allocated: Float
  }

  type BudgetSubmeasure {
    unique_id: String,
    submeasure_id: String,
    name: String

    org_id: String
    org: OrgOrFakeBudgetOrg
    measure_id: String
    measure: BudgetMeasure

    allocated: Float
    remaining: Float

    program_allocations: [BudgetProgramAllocation]
  }
`;

export default function({models}){
  const get_measure_model_by_year = (year) => models[`Budget${year}Measures`];
  const get_budget_data_model_by_year = (year) => models[`Budget${year}Data`];
  const get_program_allocation_model_by_year = (year) => models[`Budget${year}ProgramAllocations`];
  const get_budget_submeasure_model_by_year = (year) => models[`Budget${year}Submeasures`];
  const get_submeasure_program_allocation_model_by_year = (year) => models[`Budget${year}SubmeasureProgramAllocations`];

  const resolvers = {
    
  };
  
  return {
    schema,
    resolvers,
  };
}