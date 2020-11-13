import _ from "lodash";

import { bilingual_field } from "../schema_utils";

const schema = `
  extend type Root{
    covid_initiatives: [CovidInitiative]
    covid_measures: [CovidMeasure]
  }

  extend type Org{
    covid_initiatives: [CovidInitiative]
  }
  
  type CovidInitiative{
    id: String
    name: String

    estimates: [CovidInitiativeEstimates]
  }

  type CovidInitiativeEstimates{
    org_id: String

    covid_measure_ids: [String]
    covid_measures: [CovidMeasure]

    fiscal_year: String
    est_doc: String
    vote: Float
    stat: Float
  }

  type CovidMeasure{
    id: String
    name: String
  }
`;

export default function ({ models, loaders }) {
  const { covid_initiatives_by_org_id_loader, covid_measure_loader } = loaders;

  const resolvers = {
    Root: {
      covid_initiatives: () => models.CovidInitiative.find({}),
      covid_measures: () => models.CovidMeasure.find({}),
    },
    Org: {
      covid_initiatives: ({ org_id }) =>
        covid_initiatives_by_org_id_loader.load(org_id),
    },
    CovidInitiativeEstimates: {
      covid_measures: ({ covid_measure_ids }) =>
        covid_measure_loader.loadMany(covid_measure_ids),
    },
    CovidInitiative: {
      id: _.property("covid_initiative_id"),
      name: bilingual_field("name"),
    },
    CovidMeasure: {
      id: _.property("covid_measure_id"),
      name: bilingual_field("name"),
    },
  };

  return {
    schema,
    resolvers,
  };
}
