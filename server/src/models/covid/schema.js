import _ from "lodash";

import { bilingual_field } from "../schema_utils";

const schema = `
  extend type Org{
    covid_initiative_estimates: [CovidInitiativeEstimates]
  }
  
  type CovidInitiativeEstimates{
    covid_initiative_id: String
    covid_initiative: CovidInitiative

    fiscal_year: String
    vote: Float
    stat: Float
  }

  type CovidInitiative{
    id: String
    name: String
  }
`;

export default function ({ models, loaders }) {
  const {
    CovidInitiativeEstimates_org_id_loader,
    CovidInitiative_loader,
  } = loaders;

  const resolvers = {
    Org: {
      covid_initiative_estimates: (org) =>
        org.org_id
          ? CovidInitiativeEstimates_org_id_loader.load(org.org_id)
          : null,
    },
    CovidInitiativeEstimates: {
      covid_initiative: ({ covid_initiative_id }) =>
        CovidInitiative_loader.load(covid_initiative_id),
    },
    CovidInitiative: {
      id: _.property("covid_initiative_id"),
      name: bilingual_field("name"),
    },
  };

  return {
    schema,
    resolvers,
  };
}
