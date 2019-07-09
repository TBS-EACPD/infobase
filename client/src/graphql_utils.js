import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { graphql as apollo_connect } from 'react-apollo';
import string_hash from 'string-hash';
import { compressToBase64 } from 'lz-string';

const prod_api_url = `https://us-central1-ib-serverless-api-prod.cloudfunctions.net/prod-api-${window.sha}/graphql`;

let api_url;
const get_api_url = async () => {
  if (!api_url){
    if(window.is_ci){
      api_url = `hacky_target_text_for_ci_to_replace_with_test_and_deploy_time_api_urls`;
    } else if (window.is_dev){
      api_url = `http://${window.local_ip}:1337/graphql`;

      // need to be careful if local IP's changed since the local_ip env var was set (last time
      // webpack process was restarted), if it has then fall back to using local host
      api_url = await fetch(`${api_url}?query={ root(lang: "en") { gov { id } } }`)
        .then( (response ) => api_url )
        .catch( (error) => "http://127.0.0.1:1337/graphql" );
    } else {
      api_url = prod_api_url;
    }
  }
  
  return api_url;
};

// Makes our GET requests tolerant of long queries, sufficient but may not work for arbitrarily long queries
const query_length_tolerant_fetch = async (uri, options) => {
  const url_encoded_query = uri.split("?query=")[1];
  const query_string_hash = string_hash(url_encoded_query);

  const short_uri = `${await get_api_url()}?v=${window.sha}&queryHash=${query_string_hash}`;

  const new_options = {
    ...options,
    headers: {
      ...options.headers,
      "encoded-compressed-query": compressToBase64( decodeURIComponent(url_encoded_query) ),
    },
  };

  return fetch(short_uri, new_options);
};

let client = null;
export function get_client(){
  if(!client){
    client = new ApolloClient({
      link: createHttpLink({
        uri: prod_api_url, // query_length_tolerant_fetch replaces the uri on the fly, switches to appropriate local uri in dev
        fetchOptions: { method: "GET" },
        fetch: query_length_tolerant_fetch,
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
    return <div> Loading ... </div>;
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
};

//for use in development only
export const LoadingHoc = ({Component,query,data_to_props=_.identity,variables}) => apollo_connect(query, {
  options: variables ? { variables } : {},
})(InnerLoadingHoc({Component,data_to_props}));


window._DEV_HELPERS.query_api = (query) => client.query({ query });