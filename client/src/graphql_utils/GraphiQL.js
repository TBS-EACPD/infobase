// strange error: "casing of graphiql does not match the underlying filesystem". Disable eslint import on this file
/* eslint-disable import/no-unresolved  */
/* eslint-disable import/order  */

import GraphiQL from "graphiql";
import fetch from "isomorphic-fetch";

import { SpinnerWrapper, ContainerEscapeHatch } from "../components/index.js";
import { log_standard_event } from "../core/analytics.js";
import { StandardRouteContainer } from "../core/NavComponents.js";

import { get_api_url } from "./graphql_utils.js";
import "graphiql/graphiql.css";

const defaults = {
  query: `query($lang: String!, $org_id: String){
  root(lang: $lang){
    org(org_id: $org_id){
      name
    }
  }
}`,
  variables: '{"lang": "en", "org_id": "1"}',
};

export default class _GraphiQL extends React.Component {
  constructor() {
    super();

    this.state = {
      fetcher: null,
    };
  }
  componentDidMount() {
    get_api_url().then((api_url) => {
      const fetcher = (graphql_params) => {
        // start the fetch right away
        const fetch_promise = fetch(api_url, {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(graphql_params),
        }).then((response) => response.json());

        if (graphql_params.operationName !== "IntrospectionQuery") {
          // side-effects of the query being made (logging, updating route params, etc.)
          // skipped for introspection queries because one is made on every load to populate the doc explorer drawer
          log_standard_event({
            SUBAPP: window.location.hash.replace("#", ""),
            MISC1: "GraphiQL query",
            MISC2: graphql_params,
          });

          const encoded_query = encodeURIComponent(graphql_params.query);
          const encoded_variables = _.chain(graphql_params.variables)
            .thru((variables) =>
              !_.isNull(variables) ? JSON.stringify(variables) : null
            )
            .thru((variable_string) =>
              !_.isNull(variable_string)
                ? encodeURIComponent(variable_string)
                : null
            )
            .value();

          this.props.history.push(
            `/graphiql/${encoded_query}${
              _.isNull(encoded_variables) ? "" : `/${encoded_variables}`
            }`
          );
        }

        // return the promise from the fetch
        return fetch_promise;
      };

      this.setState({ fetcher });
    });
  }
  render() {
    const { fetcher } = this.state;

    const {
      match: {
        params: { encoded_query, encoded_variables },
      },
    } = this.props;

    const decoded_query = encoded_query
      ? decodeURIComponent(encoded_query)
      : undefined;
    const decoded_variables = encoded_variables
      ? decodeURIComponent(encoded_variables)
      : undefined;

    const use_default_query = _.isUndefined(decoded_query);

    return (
      <StandardRouteContainer
        title={"GraphiQL"}
        breadcrumbs={["GraphiQL"]}
        description={""}
        route_key="_graphiql"
      >
        {_.isNull(fetcher) && <SpinnerWrapper />}
        {!_.isNull(fetcher) && (
          <ContainerEscapeHatch>
            <div
              style={{
                resize: "vertical",
                overflow: "auto",
                height: "80vh",
                padding: "10px",
              }}
            >
              <GraphiQL
                fetcher={fetcher}
                query={use_default_query ? defaults.query : decoded_query}
                variables={
                  use_default_query ? defaults.variables : decoded_variables
                }
                docExplorerOpen={true}
                defaultVariableEditorOpen={true}
              />
            </div>
          </ContainerEscapeHatch>
        )}
      </StandardRouteContainer>
    );
  }
}
