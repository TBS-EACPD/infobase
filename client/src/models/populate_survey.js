import { gql } from "@apollo/client";

import { log_standard_event } from "../core/analytics.js";
import { get_client } from "../graphql_utils/graphql_utils.js";

const get_survey_bundle_query = () => gql`
  query($lang: String!) {
    root(lang: $lang) {
      all_orgs {
        id
      }
    }
  }
`;

export function api_load_survey_bundle() {
  const client = get_client();
  return client
    .query({
      query: get_survey_bundle_query(),
      variables: { lang: window.lang },
      _query_name: "survey_bundle",
    })
    .then((response) => {
      console.log(response.data.root);
    });
}
