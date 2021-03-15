import _ from "lodash";

import { bilingual_field } from "../schema_utils";

const estimates_fields = `
  id: String

  est_doc: String
  vote: Float
  stat: Float
`;
const expenditures_fields = `
  id: String

  vote: Float
  stat: Float
`;

const schema = `
  extend type Root {
    covid_measures: [CovidMeasure]
    covid_measure(covid_measure_id: String!): CovidMeasure
  }

  extend type Gov {
    covid_summary: [CovidGovSummary]
  }

  extend type Org {
    has_covid_data: HasCovidData
    covid_summary: CovidOrgSummary
    covid_measures: [CovidMeasure]
  }

  type CovidMeasure {
    id: String

    name: String

    has_covid_data: [HasCovidData]
    covid_data: [CovidData]
  }

  type HasCovidData {
    fiscal_year: String

    has_estimates: Boolean
    has_expenditures: Boolean
  }

  type CovidData {
    fiscal_year: String

    covid_estimates: [CovidEstimates]
    covid_expenditures: [CovidExpenditures]
  }
  type CovidEstimates {
    org_id: String
    org: Org

    ${estimates_fields}
  }
  type CovidExpenditures {
    org_id: String
    org: Org

    ${expenditures_fields}
  }

  type CovidGovSummary {
    id: String
    fiscal_year: String

    top_spending_orgs(top_x: Int): [Org]
    top_spending_measures(top_x: Int): [CovidMeasure]

    covid_estimates: [CovidEstimatesSummary]
    covid_expenditures: CovidExpendituresSummary

    measure_counts: [CovidSummaryCounts],
    org_counts: [CovidSummaryCounts],
  }
  type CovidSummaryCounts {
    with_authorities: Int
    with_spending: Int
  }

  type CovidOrgSummary {
    id: String
    fiscal_year: String

    covid_estimates: [CovidEstimatesSummary]
    covid_expenditures: CovidExpendituresSummary
  }

  type CovidEstimatesSummary {
    ${estimates_fields}
  }
  type CovidExpendituresSummary {
    ${expenditures_fields}
  }
`;

export default function ({ models, loaders }) {
  const { CovidMeasure } = models;

  const {
    org_id_loader,
    has_covid_data_loader,
    covid_measure_loader,
    covid_measures_by_related_org_ids_loader,
    covid_gov_summary_loader,
    covid_org_summary_loader,
  } = loaders;

  const has_covid_data_resolver = (subject_id) =>
    has_covid_data_loader.load(subject_id).then(
      (has_covid_data) =>
        has_covid_data || {
          has_estimates: false,
          has_expenditures: false,
        }
    );

  const resolvers = {
    Root: {
      covid_measures: () => CovidMeasure.find({}),
      covid_measure: (_x, { covid_measure_id }) =>
        covid_measure_loader.load(covid_measure_id),
    },
    Gov: {
      covid_summary: () => covid_gov_summary_loader.load("gov"),
    },
    CovidGovSummary: {
      top_spending_orgs: ({ spending_sorted_org_ids }, { top_x = 5 }) =>
        _.chain(spending_sorted_org_ids.toObject())
          .take(top_x)
          .thru((ids) => org_id_loader.loadMany(ids))
          .value(),
      top_spending_measures: ({ spending_sorted_measure_ids }, { top_x = 5 }) =>
        _.chain(spending_sorted_measure_ids.toObject())
          .take(top_x)
          .thru((ids) => covid_measure_loader.loadMany(ids))
          .value(),
    },
    Org: {
      has_covid_data: ({ org_id }) => has_covid_data_resolver(org_id),
      covid_summary: ({ org_id }) => covid_org_summary_loader.load(org_id),
      covid_measures: ({ org_id: queried_org_id }) =>
        covid_measures_by_related_org_ids_loader.load(queried_org_id),
    },
    CovidMeasure: {
      id: _.property("covid_measure_id"),
      name: bilingual_field("name"),
      has_covid_data: ({ covid_measure_id }) =>
        has_covid_data_resolver(covid_measure_id),
    },
    CovidEstimates: {
      org: ({ org_id }) => org_id_loader.load(org_id),
    },
    CovidExpenditures: {
      org: ({ org_id }) => org_id_loader.load(org_id),
    },
  };

  return {
    schema,
    resolvers,
  };
}
