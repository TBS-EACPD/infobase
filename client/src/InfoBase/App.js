import _ from "lodash";
import React, { Suspense } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import { HeaderNotification } from "src/components/HeaderNotification/HeaderNotification";
import { LeafSpinner } from "src/components/LeafSpinner/LeafSpinner";
import { NoIndex } from "src/components/misc_util_components";
import { PageDetails } from "src/components/PageDetails";

import { DevFip } from "src/core/DevFip";
import { EasyAccess } from "src/core/EasyAccess";
import { ErrorBoundary } from "src/core/ErrorBoundary";
import { has_local_storage } from "src/core/feature_detection";
import { lang, is_a11y_mode, is_dev } from "src/core/injected_build_constants";
import { InsertRuntimeFooterLinks } from "src/core/InsertRuntimeFooterLinks";
import { RedirectHeader } from "src/core/RedirectHeader";

import { GlossarySidebarController } from "src/glossary/GlossarySidebar/GlossarySidebarController";

import { make_request } from "src/request_utils";
import { SurveyPopup } from "src/Survey/SurveyPopup";

const Home = React.lazy(() => import("src/home/home"));
const A11yHome = React.lazy(() => import("src/home/a11y_home"));
const About = React.lazy(() => import("src/about/about"));
const Contact = React.lazy(() => import("src/contact/contact"));
const FAQ = React.lazy(() => import("src/FAQ/FAQ"));
const DatasetsRoute = React.lazy(() =>
  import("src/DatasetsRoute/DatasetsRoute")
);
const IgocExplorer = React.lazy(() => import("src/IgocExplorer/IgocExplorer"));
const TagExplorer = React.lazy(() => import("src/TagExplorer/TagExplorer"));
const Glossary = React.lazy(() => import("src/glossary/glossary"));
const Infographic = React.lazy(() => import("src/infographic/Infographic"));
const EstimatesComparison = React.lazy(() =>
  import("src/EstimatesComparison/EstimatesComparison")
);
const PrivacyStatement = React.lazy(() =>
  import("src/PrivacyStatement/PrivacyStatement")
);

const LegacyRpbRedirect = React.lazy(() =>
  import("src/reports/LegacyRpbRedirect")
);
const ReportPicker = React.lazy(() =>
  import("src/reports/ReportPicker/ReportPicker")
);
const ReportBuilder = React.lazy(() =>
  import("src/reports/ReportBuilder/ReportBuilder")
);

const PanelInventory = React.lazy(() => import("src/panels/PanelInventory"));

const Survey = React.lazy(() => import("src/Survey/Survey"));

export class App extends React.Component {
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
      make_request(
        "https://storage.googleapis.com/ib-outage-bucket/outage_msg.json"
      )
        .then((response) => response.json())
        .then(({ outage, ...outage_msg_by_lang }) => {
          if (outage) {
            this.setState({
              showNotification: true,
              outage_msg: outage_msg_by_lang[lang],
            });
          }
        })
        .catch(
          /* 
            noop, risky to let this throw since it's effectively only tested in prod (TODO, write test)
            Don't want an outage message outage to _become_ an actual outage
          */
          _.noop
        );
    }
  }

  render() {
    const { outage_msg, showSurvey } = this.state;
    return (
      <ErrorBoundary>
        {is_a11y_mode && <NoIndex />}
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
        <Suspense fallback={<LeafSpinner config_name={"route"} />}>
          <Switch>
            <Route
              path="/error-boundary-test"
              component={() => {
                throw new Error("This route throws errors!");
              }}
            />
            <Redirect
              from="/metadata/:source_key?"
              to="/datasets/:source_key?"
            />
            <Route path="/datasets/:source_key?" component={DatasetsRoute} />
            <Route path="/igoc/:grouping?" component={IgocExplorer} />
            <Redirect
              from="/resource-explorer/:hierarchy_scheme?/:doc?"
              to="/tag-explorer/:hierarchy_scheme?"
            />
            <Route
              path="/tag-explorer/:hierarchy_scheme?/:period?"
              component={TagExplorer}
            />
            <Redirect
              from="/orgs/:subject_type/:subject_id/infograph/:active_bubble_id?/:options?/"
              to="/infographic/:subject_type/:subject_id/:active_bubble_id?/:options?/"
            />
            <Route
              path="/infographic/:subject_type/:subject_id/:active_bubble_id?/:options?/"
              component={Infographic}
            />
            <Route path="/glossary/:active_key?" component={Glossary} />
            <Route
              path="/reports/builder/:report_id?/:report_state?"
              component={ReportBuilder}
            />
            <Route path="/reports/picker" component={ReportPicker} />
            <Redirect from="/reports" to="/reports/picker" />
            <Route path="/rpb/:config?" component={LegacyRpbRedirect} />
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
              path="/panel-inventory/:subject_type?/:panel?/:id?"
              component={PanelInventory}
            />
            <Route path="/survey" component={Survey} />
            <Route
              path="/start"
              render={() => (is_a11y_mode ? <A11yHome /> : <Home />)}
            />
            <Redirect from="/" to="/start" />
          </Switch>
          <GlossarySidebarController />
          <PageDetails
            showSurvey={showSurvey}
            toggleSurvey={this.toggleSurvey}
            non_survey_routes={["/contact", "/survey"]}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }
}
