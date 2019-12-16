import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';
import fetch from 'isomorphic-fetch';

import { StandardRouteContainer } from '../core/NavComponents.js';
import { log_standard_event } from '../core/analytics.js';
import { SpinnerWrapper, ContainerEscapeHatch } from '../components/index.js';

import { get_api_url } from './graphql_utils.js';


const default_query = `
query{
  root(lang: "${window.lang}"){
    org(org_id: "1"){
      name
    }
  }
}
`;

export default class _GraphiQL extends React.Component {
  constructor(){
    super();

    this.state = {
      fetcher: null,
    };
  }
  componentDidMount(){
    get_api_url()
      .then( 
        (api_url) => {
          
          const fetcher = (graphql_params) => {
            // start the fetch right away
            const fetch_promise = fetch(
              api_url, 
              {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(graphql_params),
              }
            ).then( (response) => response.json() );


            if (graphql_params.operationName !== "IntrospectionQuery"){
              // side-effects of the query being made (logging, updating route params, etc.)
              // skipped for introspection queries because one is made on every load to populate the doc explorer drawer
              log_standard_event({
                SUBAPP: window.location.hash.replace('#',''),
                MISC1: "GraphiQL query",
                MISC2: graphql_params,
              });

              this.props.history.push(`/graphiql/${encodeURIComponent(graphql_params.query)}`);
            }

            // return the promise from the fetch
            return fetch_promise;
          };

          this.setState({fetcher});
        });
  }
  render(){
    const { fetcher } = this.state;

    const {
      match: {
        params: {
          encoded_query,
        },
      },
    } = this.props;

    const decoded_query = !_.isEmpty(encoded_query) ? decodeURIComponent(encoded_query) : undefined;

    return (
      <StandardRouteContainer
        title={"GraphiQL"}
        breadcrumbs={["GraphiQL"]}
        description={""}
        route_key="_graphiql"
      >  
        { _.isNull(fetcher) &&
          <SpinnerWrapper />
        }
        { !_.isNull(fetcher) &&
          <ContainerEscapeHatch>
            <div
              style={{
                resize: "vertical",
                overflow: "auto",
                minHeight: "70vh",
                height: "70vh",
                padding: "10px",
              }}
            >
              <GraphiQL
                fetcher={fetcher}
                query={decoded_query}
                defaultQuery={default_query}
                docExplorerOpen={true}
              />
            </div>
          </ContainerEscapeHatch>
        }
      </StandardRouteContainer>
    );
  }
}