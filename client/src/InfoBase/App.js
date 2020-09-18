import axios from "axios";

import { Suspense } from "react";
import { Provider } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { createStore } from "redux";

import { HeaderNotification } from "../components/HeaderNotification";
import { PageDetails } from "../components/PageDetails.js";
import { SpinnerWrapper } from "../components/SpinnerWrapper.js";
import { initialize_analytics } from "../core/analytics.js";

import { DevFip } from "../core/DevFip.js";
import { EasyAccess } from "../core/EasyAccess.js";
import { ErrorBoundary } from "../core/ErrorBoundary.js";
import { has_local_storage } from "../core/feature_detection.js";
import { InsertRuntimeFooterLinks } from "../core/InsertRuntimeFooterLinks.js";
import { ReactUnmounter } from "../core/NavComponents.js";
import { SurveyPopup } from "../core/SurveyPopup.js";
import { TooltipActivator } from "../glossary/TooltipActivator.js";

import { app_reducer } from "./AppState.js";

import {
  ensure_linked_stylesheets_load,
  retrying_react_lazy,
} from "./common_app_component_utils.js";

import "./App.scss";

const Home = retrying_react_lazy(() =>
  import(/* webpackChunkName: "Home" */ "../home/home.js")
);
const A11yHome = retrying_react_lazy(() =>
  import(/* webpackChunkName: "A11yHome" */ "../home/a11y_home.js")
);
const PartitionRoute = retrying_react_lazy(() =>
  import(
    /* webpackChunkName: "PartitionRoute" */ "../partition/partition_subapp/PartitionRoute.js"
  )
);
const BudgetMeasuresRoute = retrying_react_lazy(() =>
  import(
    /* webpackChunkName: "BudgetMeasuresRoute" */ "../partition/budget_measures_subapp/BudgetMeasuresRoute.js"
  )
);
const About = retrying_react_lazy(() =>
  import(/* webpackChunkName: "About" */ "../about/about.js")
);

const Contact = retrying_react_lazy(() =>
  import(/* webpackChunkName: "Contact" */ "../contact/contact.js")
);
const FAQ = retrying_react_lazy(() =>
  import(/* webpackChunkName: "FAQ" */ "../FAQ/FAQ.js")
);
const MetaData = retrying_react_lazy(() =>
  import(/* webpackChunkName: "Metadata" */ "../metadata/metadata.js")
);
const IgocExplorer = retrying_react_lazy(() =>
  import(
    /* webpackChunkName: "igoc_explorer" */ "../IgocExplorer/IgocExplorer.js"
  )
);
const TagExplorer = retrying_react_lazy(() =>
  import(/* webpackChunkName: "TagExplorer" */ "../TagExplorer/TagExplorer.js")
);
const Glossary = retrying_react_lazy(() =>
  import(/* webpackChunkName: "Glossary" */ "../glossary/glossary.js")
);
const ReportBuilder = retrying_react_lazy(() =>
  import(/* webpackChunkName: "ReportBuilder" */ "../rpb/index.js")
);
const Infographic = retrying_react_lazy(() =>
  import(/* webpackChunkName: "Infographic" */ "../infographic/Infographic.js")
);
const EstimatesComparison = retrying_react_lazy(() =>
  import(
    /* webpackChunkName: "EstimatesComparison" */ "../EstimatesComparison/EstimatesComparison.js"
  )
);
const PrivacyStatement = retrying_react_lazy(() =>
  import(
    /* webpackChunkName: "PrivacyStatement" */ "../PrivacyStatement/PrivacyStatement.js"
  )
);
const TreeMap = retrying_react_lazy(() =>
  import(/* webpackChunkName: "TreeMap" */ "../TreeMap/TreeMap.js")
);
const TextDiff = retrying_react_lazy(() =>
  import(/* webpackChunkName: "TextDiff" */ "../TextDiff/TextDiff.js")
);
const Lab = retrying_react_lazy(() =>
  import(/* webpackChunkName: "InfoLab" */ "../InfoLab/InfoLab.js")
);
const IsolatedPanel = retrying_react_lazy(() =>
  import(
    /* webpackChunkName: "IsolatedPanel" */ "../panels/panel_routes/IsolatedPanel.js"
  )
);
const PanelInventory = retrying_react_lazy(() =>
  import(
    /* webpackChunkName: "PanelInventory" */ "../panels/panel_routes/PanelInventory.js"
  )
);
const GraphiQL = retrying_react_lazy(() =>
  import(/* webpackChunkName: "GraphiQL" */ "../graphql_utils/GraphiQL.js")
);
const FootnoteInventory = retrying_react_lazy(() =>
  import(
    /* webpackChunkName: "FootnoteInventory" */ "../models/footnotes/FootnoteInventory.js"
  )
);

const store = createStore(app_reducer);

export class App extends React.Component {
  constructor() {
    super();
    initialize_analytics();

    ensure_linked_stylesheets_load();
  }

  state = {
    showNotification: false,
    message: "",
    showSurvey: false,
  };

  hideNotification = () => {
    this.setState({ showNotification: false });
  };

  toggleSurvey = (override = null) => {
    this.setState((prevState) => {
      return {
        showSurvey: !_.isNil(override) ? override : !prevState.showSurvey,
      }; //add es2020 nullish coalescing when possible
    });
  };

  componentDidMount() {
    if (!window.is_dev) {
      axios
        .get("https://storage.googleapis.com/ib-outage-bucket/outage_msg.json")
        .then((res) => {
          const data = res.data;
          if (data.outage) {
            this.setState({
              showNotification: true,
              message: data[window.lang],
            });
          }
        });
    }
  }

  render() {
    return (
      <div
        tabIndex={-1}
        id="app-focus-root"
        className={`app-focus-root--${
          window.is_a11y_mode ? "a11y" : "standard"
        }`}
      >
        <Provider store={store}>
          <ErrorBoundary>
            <DevFip />
            <InsertRuntimeFooterLinks />
            <EasyAccess />
            {this.state.showNotification && (
              <HeaderNotification
                text={this.state.message}
                hideNotification={this.hideNotification}
              />
            )}
            {has_local_storage && (
              <SurveyPopup
                toggleSurvey={this.toggleSurvey}
                showSurvey={this.state.showSurvey}
              />
            )}
            <ReactUnmounter />
            {!window.is_a11y_mode && <TooltipActivator />}
            <Suspense fallback={<SpinnerWrapper config_name={"route"} />}>
              <Switch>
                <Route
                  path="/error-boundary-test"
                  component={() => {
                    throw "This route throws errors!";
                  }}
                />
                <Route path="/metadata/:data_source?" component={MetaData} />
                <Route path="/igoc/:grouping?" component={IgocExplorer} />
                <Redirect
                  from="/resource-explorer/:hierarchy_scheme?/:doc?"
                  to="/tag-explorer/:hierarchy_scheme?"
                />
                <Route
                  path="/tag-explorer/:hierarchy_scheme?/:period?"
                  component={TagExplorer}
                />
                <Route
                  path="/orgs/:level/:subject_id/infograph/:active_bubble_id?/:options?/"
                  component={Infographic}
                />
                <Route path="/glossary/:active_key?" component={Glossary} />
                <Redirect
                  from="/budget-measures/:first_column?/:selected_value?/:budget_year?"
                  to="/budget-tracker/:first_column?/:selected_value?/:budget_year?"
                />
                <Route
                  path="/budget-tracker/:first_column?/:selected_value?/:budget_year?"
                  component={BudgetMeasuresRoute}
                />
                <Route path="/rpb/:config?" component={ReportBuilder} />
                <Route path="/about" component={About} />
                <Route
                  path="/contact"
                  render={() => <Contact toggleSurvey={this.toggleSurvey} />}
                />
                <Route path="/faq/:selected_qa_key?" component={FAQ} />
                <Route
                  path="/compare_estimates/:h7y_layout?"
                  component={EstimatesComparison}
                />
                <Route path="/privacy" component={PrivacyStatement} />
                <Route
                  path="/diff/:org_id?/:crso_id?/:program_id?"
                  component={TextDiff}
                />
                <Route
                  path="/lab"
                  render={() => <Lab toggleSurvey={this.toggleSurvey} />}
                />
                <Route
                  path="/panel/:level?/:subject_id?/:panel_key?"
                  component={IsolatedPanel}
                />
                <Redirect
                  from="/graph/:level?/:panel?/:id?"
                  to="/panel-inventory/:level?/:panel?/:id?"
                />
                <Route
                  path="/panel-inventory/:level?/:panel?/:id?"
                  component={PanelInventory}
                />
                <Route
                  path="/footnote-inventory"
                  component={FootnoteInventory}
                />
                <Route
                  path="/graphiql/:encoded_query?/:encoded_variables?"
                  component={GraphiQL}
                />
                {!window.is_a11y_mode && (
                  <Route
                    path="/partition/:perspective?/:data_type?"
                    component={PartitionRoute}
                  />
                )}
                {!window.is_a11y_mode && (
                  <Route
                    path="/treemap/:perspective?/:color_var?/:filter_var?/:year?/:get_changes?"
                    component={TreeMap}
                  />
                )}
                {window.is_a11y_mode && (
                  <Route
                    path="/start/:no_basic_equiv?"
                    render={() => <A11yHome toggleSurvey={this.toggleSurvey} />}
                  />
                )}
                <Route
                  path="/start"
                  render={() =>
                    window.is_a11y_mode ? (
                      <A11yHome toggleSurvey={this.toggleSurvey} />
                    ) : (
                      <Home />
                    )
                  }
                />
                <Route
                  path="/"
                  render={() =>
                    window.is_a11y_mode ? (
                      <A11yHome toggleSurvey={this.toggleSurvey} />
                    ) : (
                      <Home />
                    )
                  }
                />
              </Switch>
              <PageDetails
                showSurvey={this.state.showSurvey}
                toggleSurvey={this.toggleSurvey}
              />
            </Suspense>
          </ErrorBoundary>
        </Provider>
      </div>
    );
  }
}
