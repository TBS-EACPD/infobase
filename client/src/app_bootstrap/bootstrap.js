import 'dom4';
import 'whatwg-fetch';

import './inject_app_globals.side-effects.js';

// Extend Handlebars global with additional helpers
import '../handlebars/helpers.side-effects.js';

import '../common_css/common_css_index.side-effects.js';

import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { 
  ConnectedRouter,
  routerMiddleware, 
  connectRouter,
} from 'connected-react-router';
import { default as createHistory } from 'history/createHashHistory';
import { populate_stores } from '../models/populate_stores.js';
import { Table } from '../core/TableClass.js';
import WebFont from 'webfontloader';

import orgVoteStatQfr from "../tables/orgVoteStatQfr.js";
import orgSobjsQfr from "../tables/orgSobjsQfr.js";
import orgVoteStatPa from "../tables/orgVoteStatPa.js";
import orgSobjs from "../tables/orgSobjs.js";
import programSpending from "../tables/programSpending.js";
import orgTransferPayments from "../tables/orgTransferPayments.js";
import orgTransferPaymentsRegion from "../tables/orgTransferPaymentsRegion.js";
import orgVoteStatEstimates from "../tables/orgVoteStatEstimates.js";
import orgEmployeeType from "../tables/orgEmployeeType.js";
import orgEmployeeRegion from "../tables/orgEmployeeRegion.js";
import orgEmployeeAgeGroup from "../tables/orgEmployeeAgeGroup.js";
import programFtes from "../tables/programFtes.js";
import orgEmployeeExLvl from "../tables/orgEmployeeExLvl.js";
import programVoteStat from "../tables/programVoteStat.js";
import orgEmployeeGender from "../tables/orgEmployeeGender.js";
import orgEmployeeFol from "../tables/orgEmployeeFol.js";
import orgEmployeeAvgAge from "../tables/orgEmployeeAvgAge.js";
import programSobjs from "../tables/programSobjs.js";

const table_defs = [
  orgVoteStatQfr,
  orgSobjsQfr,
  orgVoteStatPa,
  orgSobjs,
  programSpending,
  orgTransferPayments,
  orgTransferPaymentsRegion,
  orgVoteStatEstimates,
  orgEmployeeType,
  orgEmployeeRegion,
  orgEmployeeAgeGroup,
  programFtes,
  orgEmployeeExLvl,
  programVoteStat,
  orgEmployeeGender,
  orgEmployeeFol,
  orgEmployeeAvgAge,
  programSobjs,
];


const load_fonts = () => (
  WebFont.load({
    google: {
      families: ["Roboto:300,300i,400,400i,700,700i"],
    },
  })
);

function bootstrap(App, app_reducer, done){
  
  load_fonts();

  populate_stores().then(()=>{
    _.each(table_defs, table_def => Table.create_and_register(table_def));

    // Create a history of your choosing (we're using a browser history in this case)
    const history = createHistory({hashType: "noslash"});

    // Build the middleware for intercepting and dispatching navigation actions
    const middleware = routerMiddleware(history);

    // Add the reducer to your store on the `router` key
    // Also apply our middleware for navigating
    const store = createStore(
      combineReducers({
        app: app_reducer,
        router: connectRouter(history),
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

export { bootstrap };