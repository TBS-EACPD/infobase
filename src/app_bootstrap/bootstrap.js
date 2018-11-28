import 'dom4';
import 'whatwg-fetch';

import './inject_app_globals.js';

// Extend Handlebars global with additional helpers
import '../handlebars/helpers.js';

import '../common_css/common_css_index.js';

import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { 
  ConnectedRouter,
  routerReducer,
  routerMiddleware,
  /*push,*/
} from 'react-router-redux';
import { default as createHistory } from 'history/createHashHistory';
import { populate_stores } from '../models/populate_stores.js';
import { Table } from '../core/TableClass.js';
import WebFont from 'webfontloader';

import table1 from "../tables/table1/table1.js";
import table2 from "../tables/table2/table2.js";
import table4 from "../tables/table4/table4.js";
import table5 from "../tables/table5/table5.js";
import table6 from "../tables/table6/table6.js";
import table7 from "../tables/table7/table7.js";
import table8 from "../tables/table8/table8.js";
import table9 from "../tables/table9/table9.js";
import table10 from "../tables/table10/table10.js";
import table11 from "../tables/table11/table11.js";
import table12 from "../tables/table12/table12.js";
import table112 from "../tables/table112/table112.js";
import table300 from "../tables/table300/table300.js";
import table302 from "../tables/table302/table302.js";
import table303 from "../tables/table303/table303.js";
import table304 from "../tables/table304/table304.js";
import table305 from "../tables/table305/table305.js";

const table_defs = [
  table1,
  table2,
  table4,
  table5,
  table6,
  table7,
  table8,
  table9,
  table10,
  table11,
  table12,
  table112,
  table300,
  table302,
  table303,
  table304,
  table305,
];


const load_fonts = () => (
  WebFont.load({
    google: {
      families: ["Roboto:300,300i,400,400i,700,700i"],
    },
  })
);

// Can't be used in FireFox, where cssRules from off-site style sheets are considered security risks
// Luckily only needed in IE
const has_loaded_linked_stylesheet = () => document
  .head
  .querySelector(`link[href*='${window.cdn_url}/app/extended-bootstrap.css']`)
  .sheet
  .cssRules
  .length !== 0;

function bootstrap(App, app_reducer, done){
  
  load_fonts();

  populate_stores().then(()=>{

    if ( window.feature_detection.is_IE() && !has_loaded_linked_stylesheet() ){
      // IE occasionally fails loading the extended-bootstrap style sheet 
      // (reason why unclear, very rare and won't occur with debugger open and watching the network)
      // If it hasn't been loaded by this point, then it has certainly failed, need to refresh the page to fix
      window.location.reload();
    }

    _.each(table_defs, table_def => Table.create_and_register(table_def));

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
    done();

    ReactDOM.render( 
      <Provider store={store}>
        { /* ConnectedRouter will use the store from Provider automatically */ }
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>,
      document.getElementById('app')
    ); 
  });
};

export { bootstrap }