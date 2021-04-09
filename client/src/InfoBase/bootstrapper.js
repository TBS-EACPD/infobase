/* eslint-disable import/order */
import "dom4";
import "whatwg-fetch";

import "src/common_css/common_css_index.side-effects.js";

import "src/handlebars/register_helpers.side-effects.js";

import {
  ConnectedRouter,
  routerMiddleware,
  connectRouter,
} from "connected-react-router";
import _ from "lodash";
import { createHashHistory } from "history";
import { ApolloProvider } from "@apollo/client";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, combineReducers, applyMiddleware } from "redux";

import WebFont from "webfontloader";

import { Table } from "src/core/TableClass.js";
import { populate_stores } from "src/models/populate_stores.js";

import orgEmployeeAgeGroup from "src/tables/orgEmployeeAgeGroup.js";
import orgEmployeeAvgAge from "src/tables/orgEmployeeAvgAge.js";
import orgEmployeeExLvl from "src/tables/orgEmployeeExLvl.js";
import orgEmployeeFol from "src/tables/orgEmployeeFol.js";
import orgEmployeeGender from "src/tables/orgEmployeeGender.js";
import orgEmployeeRegion from "src/tables/orgEmployeeRegion.js";
import orgEmployeeType from "src/tables/orgEmployeeType.js";
import orgSobjs from "src/tables/orgSobjs.js";
import orgTransferPayments from "src/tables/orgTransferPayments.js";
import orgTransferPaymentsRegion from "src/tables/orgTransferPaymentsRegion.js";
import orgVoteStatEstimates from "src/tables/orgVoteStatEstimates.js";
import orgVoteStatPa from "src/tables/orgVoteStatPa.js";
import programFtes from "src/tables/programFtes.js";
import programSobjs from "src/tables/programSobjs.js";
import programSpending from "src/tables/programSpending.js";
import programVoteStat from "src/tables/programVoteStat.js";
import services from "src/tables/services.js";

import { get_client } from "src/graphql_utils/graphql_utils.js";

const table_defs = [
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
  services,
];

const load_fonts = () =>
  WebFont.load({
    google: {
      families: ["Roboto:300,300i,400,400i,700,700i"],
    },
  });

function bootstrapper(App, app_reducer, done) {
  load_fonts();

  populate_stores().then(() => {
    _.each(table_defs, (table_def) => Table.create_and_register(table_def));

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
