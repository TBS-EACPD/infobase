import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { graphql as apollo_connect } from 'react-apollo';

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
      link: new HttpLink({
        uri: api_url,
        fetchOptions: { method: "GET" },
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


window._DEV_HELPERS.query_api = (query) => client.query({ query });