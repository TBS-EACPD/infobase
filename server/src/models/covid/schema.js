import _ from "lodash";

import { bilingual_field } from "../schema_utils";

const schema = `
  extend type Root{
    covid_measures: [CovidMeasure]
    covid_measure(covid_measure_id: String!): CovidMeasure
  }

  extend type Gov{
    covid_estimates_summary: [CovidEstimatesSummary]
  }

  extend type Org{
    covid_measures: [CovidMeasure]
    covid_estimates_summary: [CovidEstimatesSummary]
  }

  type CovidEstimatesSummary{
    id: String

    fiscal_year: String
    est_doc: String
    vote: Float
    stat: Float
  }

  type CovidMeasure{
    id: String
    name: String

    covid_estimates: [CovidEstimates]
  }

  type CovidEstimates{
    id: String
    
    org_id: Int
    org: Org

    fiscal_year: String
    est_doc: String
    vote: Float
    stat: Float
  }
`;

export default function ({ models, loaders }) {
  const { CovidMeasure } = models;

  const {
    org_id_loader,
    covid_measures_by_org_id_loader,
    covid_measure_loader,
    covid_estimates_summary_by_org_id_loader,
  } = loaders;

  const resolvers = {
    Root: {
      covid_measures: () => CovidMeasure.find({}),
      covid_measure: (_x, { covid_measure_id }) =>
        covid_measure_loader.load(covid_measure_id),
    },
    Gov: {
      covid_estimates_summary: () =>
        covid_estimates_summary_by_org_id_loader.load("gov"),
    },
    Org: {
      covid_measures: ({ org_id }) =>
        covid_measures_by_org_id_loader.load(org_id),
      covid_estimates_summary: ({ org_id }) =>
        covid_estimates_summary_by_org_id_loader.load(org_id),
    },
    CovidMeasure: {
      id: _.property("covid_measure_id"),
      name: bilingual_field("name"),
    },
    CovidEstimates: {
      org: ({ org_id }) => org_id_loader.load(org_id),
    },
  };

  return {
    schema,
    resolvers,
  };
}
