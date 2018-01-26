import { storiesOf } from '@storybook/react';
import React from 'react';

import gql from 'graphql-tag';
import { ApolloProvider } from 'react-apollo';

import { get_client } from '../graphql_utils.js';

import { PanelManager }  from './PanelManager.js';

import { panel_def as result_tree_panel_def } from '../apollo-treemaps/result-treemap.js';



const example_panel_def = {
  key: "org_and_program_names",

  component: ({ data: { org_name, programs } }) => {
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
    query my_panel_query($org_id: String, $lang: String!) {
      root(lang: $lang){
        org(org_id: $org_id){
          name
          programs {
            id
            name
          }
        }
      }
    }
  `,

  data_to_props({
    root: {
      org: {
        name,
        programs,
      },
    },
  }){ 
    return ({
      org_name: name,
      programs,
    });
  },


}


const example_panel_def2 = {
  key: "org_description",

  component: ({ data: { root: { org: { name, description }}}}) => {
    return (
      <div>
        name: { name }
        description: {description}
      </div>
    );
  },

  query: gql`
    query my_panel_query($org_id: String, $lang: String!) {
      root(lang: $lang){
        org(org_id: $org_id){
          name
          legal_title
        }
      }
    }
  `,

  data_to_props: _.identity,

}




const panel_defs = [
  example_panel_def,
  example_panel_def2,
  result_tree_panel_def,
];

storiesOf('PanelManager',module)
  .add('PanelManager', ()=> {

    return (
      <ApolloProvider client={get_client()}>
        <PanelManager 
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


