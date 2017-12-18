import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { graphql as apollo_connect } from 'react-apollo';



const api_url = "http://127.0.0.1:1337/?";

let client = null;

export function get_client(){
  if(!client){
    client = new ApolloClient({
      // By default, this client will send queries to the
      //  `/graphql` endpoint on the same host
      link: new HttpLink({uri:api_url}),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: "network-only",
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
    return <Component {...data_to_props(props.data)} />;
  }
}

//for use in development only
export const LoadingHoc = ({Component,query,data_to_props}) => apollo_connect(query)(InnerLoadingHoc({Component,data_to_props}))




const query = gql`
query {
  orgs {
    name
  }
}
`;

window.query_client = () => {
  return client.query({ query }).then(function(){

    var a = 1;
    a = 2;
    client;

  });
}