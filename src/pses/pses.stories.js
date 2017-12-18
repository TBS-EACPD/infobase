import { storiesOf } from '@storybook/react';
import React from 'react';

import { ApolloProvider } from 'react-apollo';
import { get_client, LoadingHoc } from '../graphql_utils.js';


import { QuestionGridConfig, QuestionDataVis } from './pses-components.js';

storiesOf('pses_components',module)
  .add('appollo__pses_question_grid', ()=> {

    const El = LoadingHoc(QuestionGridConfig);
    return (
      <ApolloProvider client={get_client()}>
        <El />
      </ApolloProvider>
    );
  });

