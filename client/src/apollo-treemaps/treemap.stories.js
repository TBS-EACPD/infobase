import { storiesOf } from '@storybook/react';
import React from 'react';

import { ApolloProvider } from 'react-apollo';
import { get_client, LoadingHoc } from '../graphql_utils.js';

//import { ResultTreemapConfig } from './result-treemap.js';

storiesOf('treemaps',module)
  .add('result treemap', ()=> {

    //const El = LoadingHoc(ResultTreemapConfig);

    return (
      <ApolloProvider client={get_client()}>
      </ApolloProvider>
    );
  });

