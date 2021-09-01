import _ from "lodash";

import { headcount_types } from "./utils.js";

const schema = `
  extend type Org {
    people_data: OrgPeopleData
  }
  type OrgPeopleData {
    org_id: String

    average_age: [YearlyData]

    ${_.chain(headcount_types)
      .map((headcount_type) => `${headcount_type}: [OrgHeadcountData]`)
      .join("\n  ")
      .value()}
  }
  type OrgHeadcountData {
    dimension: String
    yearly_data: [YearlyData]
    avg_share: Float
  }

  extend type Gov {
    people_data: GovPeopleSummary
  }
  type GovPeopleSummary {
    id: String

    average_age: [YearlyData]
    
    ${_.chain(headcount_types)
      .map((headcount_type) => `${headcount_type}: [SummaryHeadcountData]`)
      .join("\n  ")
      .value()}
  }
  type SummaryHeadcountData {
    dimension: String
    yearly_data: [YearlyData]
  }

  type YearlyData {
    year: Int,
    value: Float
  }
`;

export default function ({ models, loaders }) {
  const { org_people_data_loader, gov_people_summary_loader } = loaders;
  const resolvers = {
    Org: {
      people_data: ({ org_id }) => org_people_data_loader.load(org_id),
    },
    Gov: {
      people_data: () => gov_people_summary_loader.load("gov"),
    },
  };
  return {
    schema,
    resolvers,
  };
}
