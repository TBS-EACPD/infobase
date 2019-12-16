import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';
import fetch from 'isomorphic-fetch';

import { StandardRouteContainer } from '../core/NavComponents.js';
import { log_standard_event } from '../core/analytics.js';
import { SpinnerWrapper, ContainerEscapeHatch } from '../components/index.js';

import { get_api_url } from './graphql_utils.js';

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
        (api_url) => this.setState({
          fetcher: (graphql_params) => fetch(
            api_url, 
            {
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(graphql_params),
            }
          ).then( response => response.json() ),
        }) 
      );
  }
  render(){
    const { fetcher } = this.state;

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
              <GraphiQL fetcher={fetcher} />
            </div>
          </ContainerEscapeHatch>
        }
      </StandardRouteContainer>
    );
  }
}