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
    all_budget_measures(year: Int): [BudgetMeasure]
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
    description: String

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
    FakeBudgetOrg: {
      name: bilingual_field("name"),

      //budget_measures: ({org_id}, {year}) => "todo",
    },
    Gov: {
      fake_budget_orgs: async () => await models.FakeBudgetOrgSubject.find({}),
      //budget_measures: (_x, {year}) => "todo",
      all_budget_measures: async (_x, {year}) => await get_measure_model_by_year(year).find({}),
    },
    Org: {
      //budget_measures: ({org_id}, {year}) => "todo",
    },
    Crso: {
      //budget_measures: ({crso_id}, {year}) => "todo",
    },
    Program: {
      //budget_measures: ({program_id}, {year}) => "todo",
    },

    BudgetMeasure: {
      name: bilingual_field("name"),
      section_id: bilingual_field("section_id"),
      description: bilingual_field("description"),

      //data: ({year, measure_id}) => "todo",
    },
    BudgetData: {
      description: bilingual_field("descriptionription"),

      //org: ({org_id}) => "todo",
      //measure: ({year, measure_id, org_id}) => "todo",
      //program_allocations: ({year, measure_id, org_id}) => "todo",
      //submeasure_breakouts: ({year, measure_id, org_id}) => "todo",
    },
    BudgetProgramAllocation: {
      //subject: ({subject_id}) => "todo",
      //org_id: ({org_id}) => "todo",
      //measure: ({year, measure_id}) => "todo",
    },
    BudgetSubmeasure: {
      //org: ({org_id}) => "todo",
      //measure: ({year, measure_id}) => "todo",

      //program_allocations: ({year, submeasure_id, org_id}) => "todo",
    },
  };
  
  return {
    schema,
    resolvers,
  };
}