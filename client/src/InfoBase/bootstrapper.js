/* eslint-disable import/order */
import "dom4";
import "whatwg-fetch";

import "../common_css/common_css_index.side-effects.js";

import "../handlebars/register_helpers.side-effects.js";

import {
  ConnectedRouter,
  routerMiddleware,
  connectRouter,
} from "connected-react-router";
import _ from "lodash";
import { default as createHistory } from "history/createHashHistory";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, combineReducers, applyMiddleware } from "redux";

import WebFont from "webfontloader";

import { Table } from "../core/TableClass.js";
import { populate_stores } from "../models/populate_stores.js";

import orgEmployeeAgeGroup from "../tables/orgEmployeeAgeGroup.js";
import orgEmployeeAvgAge from "../tables/orgEmployeeAvgAge.js";
import orgEmployeeExLvl from "../tables/orgEmployeeExLvl.js";
import orgEmployeeFol from "../tables/orgEmployeeFol.js";
import orgEmployeeGender from "../tables/orgEmployeeGender.js";
import orgEmployeeRegion from "../tables/orgEmployeeRegion.js";
import orgEmployeeType from "../tables/orgEmployeeType.js";
import orgSobjs from "../tables/orgSobjs.js";
import orgTransferPayments from "../tables/orgTransferPayments.js";
import orgTransferPaymentsRegion from "../tables/orgTransferPaymentsRegion.js";
import orgVoteStatEstimates from "../tables/orgVoteStatEstimates.js";
import orgVoteStatPa from "../tables/orgVoteStatPa.js";
import programFtes from "../tables/programFtes.js";
import programSobjs from "../tables/programSobjs.js";
import programSpending from "../tables/programSpending.js";
import programVoteStat from "../tables/programVoteStat.js";

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

  populate_stores().then(() => {
    _.each(table_defs, (table_def) => Table.create_and_register(table_def));

    const history = createHistory({ hashType: "noslash" });

    const middleware = routerMiddleware(history);

    const store = createStore(
      combineReducers({
        app: app_reducer,
        router: connectRouter(history),
      }),
      applyMiddleware(middleware)
    );

    done();

    ReactDOM.render(
      <Provider store={store}>
        {/* ConnectedRouter will use the store from Provider automatically */}
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>,
      document.getElementById("app")
    );
  });
}

export { bootstrapper };
