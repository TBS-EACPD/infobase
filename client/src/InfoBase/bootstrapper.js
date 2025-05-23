import "./site.scss";
import "./utils.scss";

import "src/handlebars/register_helpers.side-effects";

import { ApolloProvider } from "@apollo/client";
import {
  ConnectedRouter,
  routerMiddleware,
  connectRouter,
} from "connected-react-router";
import { createHashHistory } from "history";
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, combineReducers, applyMiddleware } from "redux";
import WebFont from "webfontloader";

import { populate_initial_stores_from_lookups } from "src/models/populate_initial_stores_from_lookups";

import { initialize_analytics } from "src/core/analytics";

import {
  get_client,
  wake_up_graphql_cloud_function,
} from "src/graphql_utils/graphql_utils";

import orgSobjs from "src/tables/orgSobjs";
import orgTransferPayments from "src/tables/orgTransferPayments";
import orgVoteStatEstimates from "src/tables/orgVoteStatEstimates";
import orgVoteStatPa from "src/tables/orgVoteStatPa";
import programFtes from "src/tables/programFtes";
import programSobjs from "src/tables/programSobjs";
import programSpending from "src/tables/programSpending";
import programVoteStat from "src/tables/programVoteStat";
import { Table } from "src/tables/TableClass";

import { app_reducer } from "./AppState";

const table_defs = [
  orgVoteStatPa,
  orgSobjs,
  programSpending,
  orgTransferPayments,
  orgVoteStatEstimates,
  programFtes,
  programVoteStat,
  programSobjs,
];

const load_fonts = () =>
  WebFont.load({
    google: {
      families: ["Roboto:300,300i,400,400i,700,700i"],
    },
  });

function bootstrapper(App, done) {
  load_fonts();

  initialize_analytics();
  wake_up_graphql_cloud_function();

  populate_initial_stores_from_lookups().then(() => {
    _.each(table_defs, (table_def) =>
      Table.store.create_and_register(table_def)
    );

    const history = createHashHistory({ hashType: "noslash" });

    const middleware = routerMiddleware(history);

    const store = createStore(
      combineReducers({
        app: app_reducer,
        router: connectRouter(history),
      }),
      applyMiddleware(middleware)
    );

    const client = get_client();
    done();

    ReactDOM.render(
      <ApolloProvider client={client}>
        <Provider store={store}>
          {/* ConnectedRouter will use the store from Provider automatically */}
          <ConnectedRouter history={history}>
            <App />
          </ConnectedRouter>
        </Provider>
      </ApolloProvider>,
      document.getElementById("app")
    );
  });
}

export { bootstrapper };
