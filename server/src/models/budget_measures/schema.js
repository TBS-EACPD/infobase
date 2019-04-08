import _ from "lodash";

import { bilingual_field } from '../schema_utils.js';

const schema = `
  extend type Root {
    all_budget_measures: [BudgetMeasure]
    budget_measure(measure_id: String): BudgetMeasure
  }

  type BudgetMeasure {
    id: String
    measure_id: String
    name: String
    chapter_key: ChapterKey
    desc: String
    funded_org_ids: [String]
    funded_orgs: [OrgOrSpecialFundingCase]
    budget_funds_data: [BudgetFundsData]
  }
  enum ChapterKey {
    adv
    grw
    oth
    prg
    rec
  }

  extend type Org {
    budget_funds_data: [BudgetFundsData]
  }
  extend type Gov {
    budget_funds_data: [BudgetFundsData]
  }

  type BudgetFundsData {
    measure_id: String
    budget_measure: BudgetMeasure
    org_id: String
    org: OrgOrSpecialFundingCase
    budget_funding: Float
    budget_allocated: Float
    budget_withheld: Float
    budget_remaining: Float
  }

  union OrgOrSpecialFundingCase = Org | SpecialFundingCase

  type SpecialFundingCase {
    id: String
    org_id: String
    level: String
    name: String
    desc: String
    budget_funds_data: [BudgetFundsData]
  }

`;

export default function({models}){
  
  const {
    Org,
    BudgetMeasures,
    BudgetFunds,
    SpecialFundingCase,
  } = models;

  const budget_funds_data_subject_resolver = (subject) => {
    let budget_funds_rows = [];

    if (subject.level === "gov"){
      budget_funds_rows = BudgetFunds.get_all_records();
    } else if(subject.level === "org" || subject.level === "special_funding_case"){
      budget_funds_rows = BudgetFunds.get_org_records(subject.org_id);
    } else if(subject.level === "budget_measure"){
      budget_funds_rows = BudgetFunds.get_measure_records(subject.measure_id);
    }

    return budget_funds_rows;
  }
  
  const get_org_or_special_funding_case_by_id = (org_id) => {
    const special_funding_case = SpecialFundingCase.get_by_id(org_id);
    if ( _.isEmpty(special_funding_case) ){
      return Org.get_by_id(org_id);
    } else {
      return special_funding_case;
    }
  }

  const resolvers = {
    Root: {
      all_budget_measures: () => BudgetMeasures.get_all_measures(),
      budget_measure: (obj, {measure_id}) => BudgetMeasures.get_measure_by_id(measure_id),
    },
    BudgetMeasure: {
      name: bilingual_field("measure"),
      desc: bilingual_field("description"),
      funded_orgs: (budget_measure) => budget_measure.funded_org_ids.map( 
        org_id => get_org_or_special_funding_case_by_id(org_id)
      ),
      budget_funds_data: budget_funds_data_subject_resolver,
    },
    Org: { budget_funds_data: budget_funds_data_subject_resolver },
    Gov: { budget_funds_data: budget_funds_data_subject_resolver },
    BudgetFundsData: {
      budget_measure: (budget_funds_row) => BudgetMeasures.get_measure_by_id(budget_funds_row.measure_id),
      org: (budget_funds_row) => get_org_or_special_funding_case_by_id(budget_funds_row.org_id),
    },
    OrgOrSpecialFundingCase: {
      __resolveType: (obj) => {
        if (obj.org_id && obj.dept_code){
          return "Org";
        } else if(obj.org_id){
          return "SpecialFundingCase";
        } else {
          return null;
        }
      },
    },
    SpecialFundingCase: {
      name: bilingual_field("name"),
      desc: bilingual_field("description"),
      budget_funds_data: budget_funds_data_subject_resolver,
    },
  };
  
  return {
    schema,
    resolvers,
  };
}