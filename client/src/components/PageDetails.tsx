import _ from "lodash";
import React from "react";
import type { RouteComponentProps } from "react-router";
import { withRouter } from "react-router";

import { create_text_maker } from "src/models/text";

import {
  sha,
  previous_sha,
  build_date,
} from "src/core/injected_build_constants";

import { FormFrontend } from "src/FormFrontend";

import { IssueConfirmationModal } from "src/FormFrontend/IssueConfirmationModal";
import { IconGitHub } from "src/icons/icons";

import { ExternalLink } from "./misc_util_components";

import { StatelessModal } from "./modals_and_popovers/index";

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
          ? ` ${text_maker("infostatic_build_date", {
              build_date: build_date,
            })}`
          : ""}
      </span>
    );
  }
}

interface PageDetailsProps extends RouteComponentProps {
  toggleSurvey: (is_open?: boolean) => void;
  showSurvey: boolean;
  non_survey_routes: string[];
}
interface PageDetailsState {
  showReportProblem: boolean;
  showIssueConfirmation: boolean;
  issueUrl: string | null;
}

const PageDetails = withRouter(
  class PageDetails extends React.Component<
    PageDetailsProps,
    PageDetailsState
  > {
    state = {
      showReportProblem: false,
      showIssueConfirmation: false,
      issueUrl: null,
    };

    handleFormSuccess = (issueUrl: string) => {
      this.setState({
        showIssueConfirmation: true,
        issueUrl,
      });
    };

    closeIssueConfirmation = () => {
      this.setState({
        showIssueConfirmation: false,
        issueUrl: null,
      });
    };

    render() {
      const { showReportProblem, showIssueConfirmation, issueUrl } = this.state;
      const { location, toggleSurvey, showSurvey, non_survey_routes } =
        this.props;

      return (
        <div className="pagedetails row ml-0 mr-0">
          <div className="col-12 col-lg-8 col-md-12 p-0">
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
            on_close_callback={() =>
              this.setState({ showReportProblem: false })
            }
          >
            <FormFrontend
              template_name="report_a_problem"
              onClose={() => this.setState({ showReportProblem: false })}
              onSuccessWithIssue={this.handleFormSuccess}
            />
          </StatelessModal>

          <StatelessModal
            title={text_maker("form_submission_successful")}
            show={showIssueConfirmation}
            on_close_callback={this.closeIssueConfirmation}
            size="lg"
          >
            <IssueConfirmationModal issueUrl={issueUrl || ""} />
          </StatelessModal>

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
            on_close_callback={() => toggleSurvey(false)}
          >
            <FormFrontend
              top_border={false}
              template_name="feedback"
              onClose={() => toggleSurvey(false)}
            />
          </StatelessModal>

          <div className="pagedetails__version-number col-12 col-lg-4 col-md-6">
            <VersionNumber />
          </div>
        </div>
      );
    }
  }
);

export { PageDetails };
