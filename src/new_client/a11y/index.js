import '../../bootstrap/include_common.js';
import '../../../external-dependencies/spin.min.exec.js';

import { App, app_reducer } from './App.js';

import ReactDOM from 'react-dom';

import { 
  createStore, 
  combineReducers, 
  applyMiddleware,
} from 'redux';

import { Provider } from 'react-redux';

import { 
  ConnectedRouter, 
  routerReducer, 
  routerMiddleware, 
  //push,
} from 'react-router-redux';
import createHistory from 'history/createHashHistory';

import { ApolloProvider } from 'react-apollo';
import { get_client } from '../../graphql_utils.js';

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory({hashType: "noslash"});

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history)

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = createStore(
  combineReducers({
    app: app_reducer,
    router: routerReducer,
  }),
  applyMiddleware(middleware)
);

// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))

ReactDOM.render( 
  <Provider store={store}>
    { /* ConnectedRouter will use the store from Provider automatically */ }
    <ConnectedRouter history={history}>
      { /* ApolloProvider allows components anywhere in the tree to use the 'graphql' decorator */ }
      <ApolloProvider client={get_client()}>
        <App />
      </ApolloProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);



