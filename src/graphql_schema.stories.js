import { storiesOf } from '@storybook/react';
import React from 'react';
import { setupGraphiQL } from '@storybook/addon-graphql'

const api_url = "http://localhost:1337";
function fetcher(query){
  return fetch( api_url,{
    mode: 'cors',
    method: "POST",
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(resp=>resp.text())
  .then(json => JSON.parse(json))
}

const graphiql = setupGraphiQL({fetcher});

storiesOf('GraphiQL',module)
  .add('with a graphiQL component', graphiql(`{
    org(dept_code:"AGR"){
      name
    }
  }`));
