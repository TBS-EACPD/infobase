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
  
  type BudgetData {
    unique_id: String

    org_id: String
    measure_id: String

    description: String

    funding: Float
    allocated: Float
    remaining: Float
    withheld: Float

    program_allocations: [BudgetProgramAllocation]

    submeasure_breakouts: [BudgetSubmeasure]
  }

  type BudgetProgramAllocation {
    unique_id: String
    subject_id: String

    org_id: String
    measure_id: String

    allocated: Float
  }

  type BudgetSubmeasure {
    unique_id: String,
    submeasure_id: String,
    name: String

    org_id: String
    parent_measure_id: String

    allocated: Float
    withheld: Float

    program_allocations: [BudgetProgramAllocation]
  }
`;

export default function({models, loaders}){

  const get_measure_model_by_year = (year) => models[`Budget${year}Measure`];
  const get_budget_data_model_by_year = (year) => models[`Budget${year}Data`];
  const get_program_allocation_model_by_year = (year) => models[`Budget${year}ProgramAllocation`];
  const get_budget_submeasure_model_by_year = (year) => models[`Budget${year}Submeasure`];
  const get_submeasure_program_allocation_model_by_year = (year) => models[`Budget${year}SubmeasureProgramAllocation`];

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
    },
    BudgetData: {
      description: bilingual_field("description"),
    },
    BudgetSubmeasure: {
      name: bilingual_field("name"),
    },
  };
  
  return {
    schema,
    resolvers,
  };
}