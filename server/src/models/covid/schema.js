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
    covid_measures(fiscal_year: Int): [CovidMeasure]
    covid_measure(covid_measure_id: String!): CovidMeasure
  }

  extend type Gov {
    years_with_covid_data: YearsWithCovidData
    covid_summary(fiscal_year: Int): [CovidGovSummary]
  }

  extend type Org {
    years_with_covid_data: YearsWithCovidData
    covid_summary(fiscal_year: Int): [CovidOrgSummary]
    covid_measures(fiscal_year: Int): [CovidMeasure]
  }

  type CovidMeasure {
    id: String

    name: String

    years_with_covid_data: YearsWithCovidData
    covid_data(fiscal_year: Int, org_id: String): [CovidData]
  }

  type YearsWithCovidData {
    years_with_estimates: [String]
    years_with_expenditures: [String]
  }

  type CovidData {
    fiscal_year: Int

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
    fiscal_year: Int

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
    fiscal_year: Int

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
    years_with_covid_data_loader,
    covid_measure_loader,
    covid_measures_by_related_org_ids_loader,
    covid_gov_summary_loader,
    covid_org_summary_loader,
  } = loaders;

  const years_with_covid_data_resolver = (subject_id) =>
    years_with_covid_data_loader.load(subject_id).then(
      (years_with_covid_data) =>
        _.first(years_with_covid_data) || {
          years_with_estimates: [],
          years_with_expenditures: [],
        }
    );

  const optional_fiscal_year_filter = _.curry((fiscal_year, data) =>
    _.isUndefined(fiscal_year) ? data : _.filter(data, { fiscal_year })
  );

  const resolvers = {
    Root: {
      covid_measures: (_x, { fiscal_year }) =>
        CovidMeasure.find({}).then((measures) =>
          _.filter(measures, ({ related_org_ids }) =>
            _.chain(related_org_ids)
              .thru(optional_fiscal_year_filter(fiscal_year))
              .some(({ org_ids }) => !_.isEmpty(org_ids))
              .value()
          )
        ),
      covid_measure: (_x, { covid_measure_id }) =>
        covid_measure_loader.load(covid_measure_id),
    },
    Gov: {
      years_with_covid_data: () => years_with_covid_data_resolver("gov"),
      covid_summary: (_x, { fiscal_year }) =>
        covid_gov_summary_loader
          .load("gov")
          .then(optional_fiscal_year_filter(fiscal_year)),
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
      years_with_covid_data: ({ org_id }) =>
        years_with_covid_data_resolver(org_id),
      covid_summary: ({ org_id }, { fiscal_year }) =>
        covid_org_summary_loader
          .load(org_id)
          .then(optional_fiscal_year_filter(fiscal_year)),
      covid_measures: ({ org_id: queried_org_id }, { fiscal_year }) =>
        covid_measures_by_related_org_ids_loader
          .load(queried_org_id)
          .then((measures) =>
            _.filter(measures, ({ related_org_ids }) =>
              _.chain(related_org_ids)
                .thru(optional_fiscal_year_filter(fiscal_year))
                .some(({ org_ids }) => _.includes(org_ids, queried_org_id))
                .value()
            )
          ),
    },
    CovidMeasure: {
      id: _.property("covid_measure_id"),
      name: bilingual_field("name"),
      years_with_covid_data: ({ covid_measure_id }) =>
        years_with_covid_data_resolver(covid_measure_id),
      covid_data: ({ covid_data }, { fiscal_year, org_id }) =>
        _.chain(covid_data)
          .thru(optional_fiscal_year_filter(fiscal_year))
          .thru((covid_data) => {
            if (_.isUndefined(org_id)) {
              return covid_data;
            } else {
              return _.chain(covid_data)
                .map(
                  ({ fiscal_year, covid_estimates, covid_expenditures }) => ({
                    fiscal_year,
                    ..._.mapValues(
                      { covid_estimates, covid_expenditures },
                      (rows) => _.filter(rows, { org_id })
                    ),
                  })
                )
                .filter(
                  ({ covid_estimates, covid_expenditures }) =>
                    !_.isEmpty(covid_estimates) ||
                    !_.isEmpty(covid_expenditures)
                )
                .value();
            }
          })
          .value(),
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
