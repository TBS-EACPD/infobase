import Omnibar from 'omnibar';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo/withApollo';
import { 
  Link,
  withRouter,
} from 'react-router-dom';

import { hashless_infograph_link } from './infograph_link';


const search_query = gql`
  query SearchQuery($lang: String!, $query: String!) {
    root(lang: $lang){
      subject_search(query: $query) {
        id
        level
        name
      }
    }
  }
`;

const get_search_results = client => query => client.query({
  query:search_query, 
  variables: {
    lang: window.lang,
    query,
  },
}).then(data => {
  return data.data.root.subject_search
});

const InfographicLinkRenderer = ({ item }) => (
  <Link to={hashless_infograph_link(item.level, item.id)}>
    {item.name}
  </Link>
);

const _SearchComponent = ({ client, history }) => <div>
  <Omnibar
    maxViewableResults={10}
    maxResults={100}
    placeholder="Search for org/prog"
    extensions={[ get_search_results(client) ]}
    resultRenderer={ ({item}) =>
      <InfographicLinkRenderer item={item} /> 
    }
    onAction={ item => {
      history.push(hashless_infograph_link(item.level,item.id));
      document.getElementById("app-focus-root").focus();
    }}
  > 
  
  </Omnibar>
</div>

export const SearchComponent = withRouter(withApollo(_SearchComponent));