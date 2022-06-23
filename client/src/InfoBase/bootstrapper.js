import "./site.scss";
import "./utils.scss";

import "src/handlebars/register_helpers.side-effects";

import { ApolloProvider } from "@apollo/client";
import _ from "lodash";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createStore, combineReducers } from "redux";
import WebFont from "webfontloader";

import { populate_initial_stores_from_lookups } from "src/models/populate_initial_stores_from_lookups";

import { initialize_analytics } from "src/core/analytics";

import {
  get_client,
  wake_up_graphql_cloud_function,
} from "src/graphql_utils/graphql_utils";

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
import { Table } from "src/tables/TableClass";

import { app_reducer } from "./AppState";

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

function bootstrapper(App, done) {
  load_fonts();

  initialize_analytics();
  wake_up_graphql_cloud_function();

  populate_initial_stores_from_lookups().then(() => {
    _.each(table_defs, (table_def) =>
      Table.store.create_and_register(table_def)
    );

    const store = createStore(
      combineReducers({
        app: app_reducer,
      })
    );

    const client = get_client();
    done();

    createRoot(document.getElementById("app")).render(
      <ApolloProvider client={client}>
        <Provider store={store}>
          <App />
        </Provider>
      </ApolloProvider>
    );
  });
}

export { bootstrapper };
