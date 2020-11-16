import gql from "graphql-tag";

import { log_standard_event } from "../../core/analytics.js";
import { get_client } from "../../graphql_utils/graphql_utils.js";

import { Subject } from "../subject.js";

const { CovidMeasures } = Subject;

const covid_measures_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      covid_measures {
        id
        name
      }
    }
  }
`;

export function api_load_covid_measures() {
  if (!_.isEmpty(CovidMeasures.get_all())) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  const client = get_client();
  return client
    .query({
      covid_measures_query,
      variables: {
        lang: window.lang,
        _query_name: "covid_measures",
      },
    })
    .then((response) => {
      const covid_measures = response.data.root;

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(covid_measures)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Covid measures, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Covid measures, took ${resp_time} ms`,
        });
      }

      _.each(covid_measures, (measure) =>
        CovidMeasures.create_and_register(measure)
      );

      return Promise.resolve();
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Covid measures, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
}
