import "./PageDetails.scss";
import text from "./PageDetails.yaml";

import { Details } from "./Details.js";
import { ExternalLink } from "./misc_util_components.js";

import { create_text_maker } from "../models/text.js";
import { IconGitHub } from "../icons/icons.js";
import { EmailFrontend } from "./EmailFrontend.js";
import { StatelessModal } from "./modals_and_popovers";

const text_maker = create_text_maker(text);

const github_link = `https://github.com/TBS-EACPD/infobase/${
  window.previous_sha
    ? `compare/${window.previous_sha}...${window.sha}`
    : `commit/${window.sha}`
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
          {` ${window.sha} `}
          <IconGitHub inline={true} />
        </ExternalLink>
        {window.build_date
          ? ` ${text_maker("infobase_build_date", {
              build_date: window.build_date,
            })}`
          : ""}
      </span>
    );
  }
}

export class PageDetails extends React.Component {
  render() {
    const { toggleSurvey, showSurvey } = this.props;
    return (
      <div className="pagedetails frow">
        <div className="pagedetails__report-a-problem fcol-md-8 fcol-sm-12">
          <Details
            summary_content={text_maker("report_a_problem")}
            content={<EmailFrontend template_name="report_a_problem" />}
            persist_content={true}
          />
        </div>
        <button className="btn btn-ib-primary" onClick={() => toggleSurvey()}>
          {text_maker("feedback")}
        </button>
        <StatelessModal
          title={text_maker("feedback")}
          show={showSurvey}
          body={<EmailFrontend top_border={false} template_name="feedback" />}
          on_close_callback={() => toggleSurvey()}
        />
        <div className="pagedetails__version-number fcol-md-4 fcol-sm-6">
          <VersionNumber />
        </div>
      </div>
    );
  }
}
