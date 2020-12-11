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

    has_covid_data: Boolean
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
    in_estimates: Boolean

    covid_estimates: [CovidEstimates]
    covid_expenditures: [CovidExpenditures]
    covid_commitments: [CovidCommitments]
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
  type CovidExpenditures{
    id: String
    
    org_id: Int
    org: Org

    fiscal_year: String
    is_budgetary: Boolean
    vote: Float
    stat: Float
  }
  type CovidCommitments{
    id: String
    
    org_id: Int
    org: Org

    fiscal_year: String
    commitment: Float
  }
`;

export default function ({ models, loaders }) {
  const { CovidMeasure } = models;

  const {
    org_id_loader,
    has_covid_measure_loader,
    covid_measure_loader,
    covid_measures_by_org_id_loader,
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
      covid_measures: ({ org_id: queried_org_id }) =>
        covid_measures_by_org_id_loader.load(queried_org_id).then((measures) =>
          _.map(measures, (measure) => {
            const filtered_data = _.chain(measure)
              .pick([
                "covid_estimates",
                "covid_expenditures",
                "covid_commitments",
              ])
              .mapValues((rows) =>
                _.filter(
                  rows,
                  ({ org_id: row_org_id }) => row_org_id === queried_org_id
                )
              )
              .value();

            // these objects have non-spreadable properites, assign instead (and clone, out of caution for assign mutating)
            return _.chain(measure).cloneDeep().assign(filtered_data).value();
          })
        ),
      covid_estimates_summary: ({ org_id }) =>
        covid_estimates_summary_by_org_id_loader.load(org_id),
      has_covid_data: ({ org_id }) =>
        has_covid_measure_loader
          .load(org_id)
          .then((record) => !_.isUndefined(record)),
    },
    CovidMeasure: {
      id: _.property("covid_measure_id"),
      name: bilingual_field("name"),
    },
    CovidEstimates: {
      org: ({ org_id }) => org_id_loader.load(org_id),
    },
    CovidExpenditures: {
      org: ({ org_id }) => org_id_loader.load(org_id),
    },
    CovidCommitments: {
      org: ({ org_id }) => org_id_loader.load(org_id),
    },
  };

  return {
    schema,
    resolvers,
  };
}
