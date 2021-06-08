/* eslint-disable import/order */
import "dom4";
import "whatwg-fetch";
import "string.prototype.replaceall/auto";

import "src/common_css/common_css_index.side-effects";

import "src/handlebars/register_helpers.side-effects";

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

import { Table } from "src/core/TableClass";
import { populate_stores } from "src/models/populate_stores";

import orgEmployeeAgeGroup from "src/tables/orgEmployeeAgeGroup";
import orgEmployeeAvgAge from "src/tables/orgEmployeeAvgAge";
import orgEmployeeExLvl from "src/tables/orgEmployeeExLvl";
import orgEmployeeFol from "src/tables/orgEmployeeFol";
import orgEmployeeGender from "src/tables/orgEmployeeGender";
import orgEmployeeRegion from "src/tables/orgEmployeeRegion";
import orgEmployeeType from "src/tables/orgEmployeeType";
import orgSobjs from "src/tables/orgSobjs";
import orgTransferPayments from "src/tables/orgTransferPayments";
import orgTransferPaymentsRegion from "src/tables/orgTransferPaymentsRegion";
import orgVoteStatEstimates from "src/tables/orgVoteStatEstimates";
import orgVoteStatPa from "src/tables/orgVoteStatPa";
import programFtes from "src/tables/programFtes";
import programSobjs from "src/tables/programSobjs";
import programSpending from "src/tables/programSpending";
import programVoteStat from "src/tables/programVoteStat";

import { get_client } from "src/graphql_utils/graphql_utils";

import { runtime_polyfills } from "./runtime_polyfills";

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
];

const load_fonts = () =>
  WebFont.load({
    google: {
      families: ["Roboto:300,300i,400,400i,700,700i"],
    },
  });

function bootstrapper(App, app_reducer, done) {
  load_fonts();

  runtime_polyfills()
    .then(populate_stores)
    .then(() => {
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
