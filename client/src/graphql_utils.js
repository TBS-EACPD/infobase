import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { graphql as apollo_connect } from 'react-apollo';
import { log_standard_event } from './core/analytics.js';

let api_url;
if(window.is_dev_build){
  api_url = `http://${ window.local_ip || "127.0.0.1" }:1337/graphql`;
} else if(window.is_ci){
  api_url = `hacky_target_text_for_ci_to_replace_with_test_and_deploy_time_api_urls`;
} else {
  api_url = `https://us-central1-ib-serverless-api-prod.cloudfunctions.net/prod-api-${window.sha}/graphql`;
}

let client = null;

export function get_client(){
  if(!client){
    client = new ApolloClient({
      // By default, this client will send queries to the
      //  `/graphql` endpoint on the same host
      link: new HttpLink({
        uri: api_url,
      }),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: "cache-first",
        },
      },
    });
  }
  return client;
}


const InnerLoadingHoc = ({Component, data_to_props}) => props => {
  if(props.data.loading){
    return <div> Loading ... </div>
  } else {
    return (
      <Component
        data={data_to_props(props.data)} 
        gql_props={{
          refetch: props.data.refetch,
          variables: props.data.variables,
        }}
      />
    );
  }
}

//for use in development only
export const LoadingHoc = ({Component,query,data_to_props=_.identity,variables}) => apollo_connect(query, {
  options: variables ? { variables } : {},
})(InnerLoadingHoc({Component,data_to_props}))




const query = gql`
query {
  root(lang:"${window.lang}"){
    org(org_id:"1") {
      name
    }
  }
}
`;

window.query_client = () => {
  return client.query({ query });
}


export function test_api_query(){
  const time_at_request = Date.now()
  get_client().query({query})
    .then(function(data){
      const resp_time = Date.now() - time_at_request
      if(_.get(data, "data.root.org.name") == window._DEV_HELPERS.Subject.Dept.lookup(1).applied_title){
        log_standard_event({
          SUBAPP: window.location.hash.replace('#',''),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace('#',''),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `took  ${resp_time} ms - ${JSON.stringify(data.data)}`,
        });  
      }
      
    
    })
    .catch(function(error){
      const resp_time = Date.now() - time_at_request      
      log_standard_event({
        SUBAPP: window.location.hash.replace('#',''),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `took  ${resp_time} ms - ${error.toString()}`,
      });
    });
}