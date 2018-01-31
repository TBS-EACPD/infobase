import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Link } from 'react-router-dom';

import { hashless_infograph_link } from '../infograph_link';

const orgs_query = gql`
  query A11YOrgsQuery($lang: String!) {
    root(lang: $lang){
      orgs {
        id
        level
        name
      }
    }
  }
`;


const InfographicLinkRenderer = ({ item }) => (
  <Link to={hashless_infograph_link(item.level, item.id)}>
    {item.name}
  </Link>
);

const _OrgIndex = ({ data }) => {

  const { loading } = data;
  if(loading){
    return <div> loading ... </div>;
  }

  const { root: { orgs } } = data;

  return <div>
    <section>
      <header> List of Organizational Infographics </header>
      <ul>
        {_.map(orgs, ({ id, level, name }) =>
          <li key={id}>
            <InfographicLinkRenderer item={{level, id, name}} />
          </li>
        )}
      </ul>
    </section>

  </div>;

};




export const OrgIndex = graphql(orgs_query, { 
  options: ()=> ({ 
    variables: {
      lang: window.lang,
    },
  }),
})(_OrgIndex);