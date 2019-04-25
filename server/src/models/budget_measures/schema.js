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

  extend type Root {
    fake_budget_orgs: [FakeBudgetOrg]
    budget_measure(year: Int, measure_id: String): BudgetMeasure
  }
  extend type Gov {
    budget_measures(year: Int): [BudgetMeasure]
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

  const validate_year = (year) => {
    if ( _.includes( budget_years, _.toString(year) ) ){
      return true;
    } else {
      throw `Invalid argument: ${year} is not a valid budget measure year. Valid years are ${budget_years.join(', ')}`;
    }
  };

  const get_measure_model_by_year = (year) => validate_year(year) && models[`Budget${year}Measure`];
  const get_measure_loader_by_year = (year) => validate_year(year) && loaders[`budget_${year}_measure_id_loader`];

  const resolvers = {
    Root: {
      fake_budget_orgs: () => models.FakeBudgetOrgSubject.find({}),
      budget_measure: (_x, {year, measure_id}) => get_measure_loader_by_year(year).load(measure_id),
    },
    Gov: {
      budget_measures: async (_x, {year}) => {
        const all_budget_measures = await get_measure_model_by_year(year).find({});

        _.each(
          all_budget_measures,
          budget_measure => get_measure_loader_by_year(year).prime(budget_measure.measure_id, budget_measure)
        );

        return all_budget_measures;
      },
    },
    FakeBudgetOrg: {
      name: bilingual_field("name"),
      budget_measures: ({org_id}, {year}) => get_measure_model_by_year(year).find({"data.org_id": org_id}),
    },
    Org: {
      budget_measures: ({org_id}, {year}) => get_measure_model_by_year(year).find({"data.org_id": org_id}),
    },
    Crso: {
      budget_measures: ({crso_id}, {year}) => get_measure_model_by_year(year).find({"data.program_allocations.subject_id": crso_id}),
    },
    Program: {
      budget_measures: ({program_id}, {year}) => get_measure_model_by_year(year).find({"data.program_allocations.subject_id": program_id}),
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