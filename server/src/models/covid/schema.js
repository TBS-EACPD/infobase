import _ from "lodash";

import { bilingual_field } from "../schema_utils";

const estimates_fields = `
  id: String
  fiscal_year: String
  est_doc: String
  vote: Float
  stat: Float
`;
const expenditures_fields = `
  id: String
  fiscal_year: String
  is_budgetary: Boolean
  vote: Float
  stat: Float
`;
const commitments_fields = `
  id: String
  fiscal_year: String
  commitment: Float
`;

const schema = `
  extend type Root{
    covid_measures: [CovidMeasure]
    covid_measure(covid_measure_id: String!): CovidMeasure
  }

  extend type Gov{
    covid_summary: CovidSummary
    covid_funding: [CovidFunding]
  }

  extend type Org{
    has_covid_data: HasCovidData
    covid_summary: CovidSummary
    covid_measures: [CovidMeasure]
  }

  type CovidMeasure{
    id: String
    name: String
    in_estimates: Boolean
    covid_funding: [CovidFunding]

    has_covid_data: HasCovidData
    
    covid_estimates: [CovidEstimates]
    covid_expenditures: [CovidExpenditures]
    covid_commitments: [CovidCommitments]
  }
  type CovidFunding{
    id: String
    fiscal_year: String
    funding: Float
  }

  type HasCovidData{
    has_estimates: Boolean
    has_expenditures: Boolean
    has_commitments: Boolean
  }

  type CovidEstimates{
    org_id: String
    org: Org

    ${estimates_fields}
  }
  type CovidExpenditures{
    org_id: String
    org: Org

    ${expenditures_fields}
  }
  type CovidCommitments{
    org_id: String
    org: Org

    ${commitments_fields}
  }

  type CovidSummary{
    id: String

    covid_estimates: [CovidEstimatesSummary]
    covid_expenditures: [CovidExpendituresSummary]
    covid_commitments: [CovidCommitmentsSummary]
  }
  type CovidEstimatesSummary{
    ${estimates_fields}
  }
  type CovidExpendituresSummary{
    ${expenditures_fields}
  }
  type CovidCommitmentsSummary{
    ${commitments_fields}
  }
`;

export default function ({ models, loaders }) {
  const { CovidMeasure } = models;

  const {
    org_id_loader,
    has_covid_data_loader,
    covid_measure_loader,
    covid_measures_by_org_id_loader,
    covid_summary_by_org_id_loader,
  } = loaders;

  const has_covid_data_resolver = (subject_id) =>
    has_covid_data_loader.load(subject_id).then(
      (has_covid_data) =>
        has_covid_data || {
          has_estimates: false,
          has_expenditures: false,
          has_commitments: false,
        }
    );

  const resolvers = {
    Root: {
      covid_measures: () => CovidMeasure.find({}),
      covid_measure: (_x, { covid_measure_id }) =>
        covid_measure_loader.load(covid_measure_id),
    },
    Gov: {
      covid_summary: () =>
        covid_summary_by_org_id_loader.load("gov").then(_.first),
      covid_funding: () =>
        covid_summary_by_org_id_loader
          .load("gov")
          .then(_.first)
          .then(({ covid_funding }) => covid_funding),
    },
    Org: {
      has_covid_data: ({ org_id }) => has_covid_data_resolver(org_id),
      covid_summary: ({ org_id }) =>
        covid_summary_by_org_id_loader.load(org_id).then(_.first),
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

            // these objects have non-spreadable properites (getters, methods, etc.), assign instead (and clone, out of caution for assign mutating)
            return _.chain(measure).cloneDeep().assign(filtered_data).value();
          })
        ),
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
    CovidCommitments: {
      org: ({ org_id }) => org_id_loader.load(org_id),
    },
  };

  return {
    schema,
    resolvers,
  };
}
