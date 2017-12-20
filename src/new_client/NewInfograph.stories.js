import { storiesOf } from '@storybook/react';
import React from 'react';

import gql from 'graphql-tag';
import { ApolloProvider } from 'react-apollo';

import { get_client } from '../graphql_utils.js';

import { InfoGraph }  from './NewInfograph';



const example_panel_def = {
  key: "org_and_program_names",

  component: ({ org_name, programs }) => {
    return (
      <div>
        name: { org_name }
        <ul>
          {_.map(programs, ({name,id}) => <li key={id}> {name} </li> )}
        </ul>
      </div>
    );
  },

  query: gql`
    query my_panel_query($org_id: String) {
      org(org_id: $org_id){
        name
        programs {
          id
          name
        }
      }
    }
  `,

  data_to_props({
    org: {
      name,
      programs,
    },
  }){ 
    return ({
      org_name: name,
      programs,
    });
  },

}

const panel_defs = [
  example_panel_def,
];

storiesOf('New Infograph',module)
  .add('Infograph', ()=> {

    return (
      <ApolloProvider client={get_client()}>
        <InfoGraph 
          panel_defs={panel_defs}
          subject_context={{
            id: "1",
            level: "org",
            org_id: "1",
            dept_code: "AGR",
          }}
        />
      </ApolloProvider>
    );
});


