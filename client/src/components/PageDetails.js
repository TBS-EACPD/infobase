import _ from "lodash";
import React from "react";
import { withRouter } from "react-router";

import {
  sha,
  previous_sha,
  build_date,
} from "src/core/injected_build_constants.js";

import { IconGitHub } from "src/icons/icons.js";
import { create_text_maker } from "src/models/text.js";

import { EmailFrontend } from "./EmailFrontend.js";
import { ExternalLink } from "./misc_util_components.js";

import { StatelessModal } from "./modals_and_popovers";

import text from "./PageDetails.yaml";

import "./PageDetails.scss";

const text_maker = create_text_maker(text);

const github_link = `https://github.com/TBS-EACPD/infobase/${
  previous_sha ? `compare/${previous_sha}...${sha}` : `commit/${sha}`
}`;

class VersionNumber extends React.Component {
  render() {
    return (
      <span>
        {text_maker("infobase_version")}
        <ExternalLink
          href={github_link}
          title={text_maker("infobase_version_link_title")}
        >
          {` ${sha} `}
          <IconGitHub inline={true} />
        </ExternalLink>
        {build_date
          ? ` ${text_maker("infobase_build_date", {
              build_date: build_date,
            })}`
          : ""}
      </span>
    );
  }
}

const PageDetails = withRouter(
  class PageDetails extends React.Component {
    state = {
      showReportProblem: false,
    };
    render() {
      const { showReportProblem } = this.state;
      const {
        location,
        toggleSurvey,
        showSurvey,
        non_survey_routes,
      } = this.props;

      return (
        <div className="pagedetails frow">
          <div className="fcol-md-8 fcol-sm-12">
            <button
              className="btn btn-ib-primary"
              onClick={() =>
                this.setState({ showReportProblem: !showReportProblem })
              }
            >
              {text_maker("report_a_problem")}
            </button>
          </div>
          <StatelessModal
            title={text_maker("report_a_problem")}
            show={showReportProblem}
            body={<EmailFrontend template_name="report_a_problem" />}
            on_close_callback={() =>
              this.setState({ showReportProblem: false })
            }
          />

          {!_.includes(non_survey_routes, location.pathname) && (
            <button
              className="btn btn-ib-primary"
              onClick={() => toggleSurvey()}
            >
              {text_maker("feedback")}
            </button>
          )}
          <StatelessModal
            title={text_maker("feedback")}
            show={showSurvey}
            body={<EmailFrontend top_border={false} template_name="feedback" />}
            on_close_callback={() => toggleSurvey(false)}
          />

          <div className="pagedetails__version-number fcol-md-4 fcol-sm-6">
            <VersionNumber />
          </div>
        </div>
      );
    }
  }
);

export { PageDetails };
