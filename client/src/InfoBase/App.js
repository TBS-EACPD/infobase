import _ from "lodash";
import React, { Suspense } from "react";
import { Provider } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { createStore } from "redux";

import { HeaderNotification } from "src/components/HeaderNotification/HeaderNotification";
import { PageDetails } from "src/components/PageDetails";
import { LeafSpinner } from "src/components/LeafSpinner/LeafSpinner";

import { initialize_analytics } from "src/core/analytics";
import { DevFip } from "src/core/DevFip";
import { EasyAccess } from "src/core/EasyAccess";
import { ErrorBoundary } from "src/core/ErrorBoundary";
import { has_local_storage } from "src/core/feature_detection";
import { lang, is_a11y_mode, is_dev } from "src/core/injected_build_constants";
import { InsertRuntimeFooterLinks } from "src/core/InsertRuntimeFooterLinks";
import { ReactUnmounter } from "src/core/NavComponents";
import { RedirectHeader } from "src/core/RedirectHeader";

import { TooltipActivator } from "src/glossary/TooltipActivator";
import { SurveyPopup } from "src/Survey/SurveyPopup";

import { app_reducer } from "./AppState";

import {
  ensure_linked_stylesheets_load,
  retrying_react_lazy,
} from "./common_app_component_utils";

import "./App.scss";

const Home = retrying_react_lazy(() => import("src/home/home"));
const A11yHome = retrying_react_lazy(() => import("src/home/a11y_home"));
const About = retrying_react_lazy(() => import("src/about/about"));
const Contact = retrying_react_lazy(() => import("src/contact/contact"));
const FAQ = retrying_react_lazy(() => import("src/FAQ/FAQ"));
const MetaData = retrying_react_lazy(() => import("src/metadata/metadata"));
const IgocExplorer = retrying_react_lazy(() =>
  import("src/IgocExplorer/IgocExplorer")
);
const TagExplorer = retrying_react_lazy(() =>
  import("src/TagExplorer/TagExplorer")
);
const Glossary = retrying_react_lazy(() => import("src/glossary/glossary"));
const ReportBuilder = retrying_react_lazy(() => import("src/rpb/index"));
const Infographic = retrying_react_lazy(() =>
  import("src/infographic/Infographic")
);
const EstimatesComparison = retrying_react_lazy(() =>
  import("src/EstimatesComparison/EstimatesComparison")
);
const PrivacyStatement = retrying_react_lazy(() =>
  import("src/PrivacyStatement/PrivacyStatement")
);
const TextDiff = retrying_react_lazy(() => import("src/TextDiff/TextDiff"));
const TreeMap = retrying_react_lazy(() => import("src/TreeMap/TreeMap"));
const IsolatedPanel = retrying_react_lazy(() =>
  import("src/panels/panel_routes/IsolatedPanel")
);
const PanelInventory = retrying_react_lazy(() =>
  import("src/panels/panel_routes/PanelInventory")
);
const GraphiQL = retrying_react_lazy(() =>
  import("src/graphql_utils/GraphiQL")
);
const FootnoteInventory = retrying_react_lazy(() =>
  import("src/models/footnotes/FootnoteInventory")
);
const Survey = retrying_react_lazy(() => import("src/Survey/Survey"));
const SingleServiceRoute = retrying_react_lazy(() =>
  import("../panels/panel_routes/SingleServiceRoute")
);

const store = createStore(app_reducer);

export class App extends React.Component {
  constructor() {
    super();
    initialize_analytics();

    ensure_linked_stylesheets_load();
  }

  state = {
    outage_message: null,
    showSurvey: false,
  };

  toggleSurvey = (override = null) => {
    this.setState((prevState) => {
      return {
        showSurvey: !_.isNil(override) ? override : !prevState.showSurvey,
      }; //add es2020 nullish coalescing when possible
    });
  };

  componentDidMount() {
    if (!is_dev) {
      fetch("https://storage.googleapis.com/ib-outage-bucket/outage_msg.json")
        .then((response) => response.json())
        .then(({ outage, ...outage_msg_by_lang }) => {
          if (outage) {
            this.setState({
              showNotification: true,
              outage_msg: outage_msg_by_lang[lang],
            });
          }
        })
        .catch(); // noop, risky to let this throw since it's effectively only tested in prod (TODO, write test). Don't want an outage message issue to itself become an effective outage
    }
  }

  render() {
    const { outage_msg, showSurvey } = this.state;
    return (
      <div
        tabIndex={-1}
        id="app-focus-root"
        className={`app-focus-root--${is_a11y_mode ? "a11y" : "standard"}`}
      >
        <Provider store={store}>
          <ErrorBoundary>
            <DevFip />
            <InsertRuntimeFooterLinks />
            <EasyAccess />
            {outage_msg && (
              <HeaderNotification
                list_of_text={[outage_msg]}
                hideNotification={() => {
                  this.setState({ outage_msg: null });
                }}
              />
            )}
            <RedirectHeader
              redirect_msg_key="redirected_msg"
              url_before_redirect_key="pre_redirected_url"
            />
            {has_local_storage && <SurveyPopup />}
            <ReactUnmounter />
            <TooltipActivator />
            <Suspense fallback={<LeafSpinner config_name={"route"} />}>
              <Switch>
                <Route
                  path="/error-boundary-test"
                  component={() => {
                    throw new Error("This route throws errors!");
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
                  path="/dept/:subject_id/service-panels/:service_id?"
                  component={SingleServiceRoute}
                />
                <Route
                  path="/orgs/:level/:subject_id/infograph/:active_bubble_id?/:options?/"
                  component={Infographic}
                />
                <Route path="/glossary/:active_key?" component={Glossary} />
                <Route path="/rpb/:config?" component={ReportBuilder} />
                <Route
                  path="/about"
                  render={() => <About toggleSurvey={this.toggleSurvey} />}
                />
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
                {!is_a11y_mode && (
                  <Route
                    path="/treemap/:perspective?/:color_var?/:filter_var?/:year?/:get_changes?"
                    component={TreeMap}
                  />
                )}
                <Route path="/survey" component={Survey} />
                {is_a11y_mode && (
                  <Route
                    path="/start/:no_basic_equiv?"
                    render={() => <A11yHome />}
                  />
                )}
                <Route
                  path="/start"
                  render={() => (is_a11y_mode ? <A11yHome /> : <Home />)}
                />
                <Route
                  path="/"
                  render={() => (is_a11y_mode ? <A11yHome /> : <Home />)}
                />
              </Switch>
              <PageDetails
                showSurvey={showSurvey}
                toggleSurvey={this.toggleSurvey}
                non_survey_routes={["/contact", "/survey"]}
              />
            </Suspense>
          </ErrorBoundary>
        </Provider>
      </div>
    );
  }
}
