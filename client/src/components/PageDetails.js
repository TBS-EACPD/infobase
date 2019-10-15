import './PageDetails.scss';
import text from './PageDetails.yaml';

import { Details } from './Details.js';
import { ExternalLink } from './misc_util_components.js';

import { create_text_maker } from '../models/text.js';
import { IconGitHub } from '../icons/icons.js';
import { EmailFrontend } from './EmailFrontend.js';

import { Fragment } from 'react';

const text_maker = create_text_maker(text);

class VersionNumber extends React.Component {
  render(){
    return (
      <span>
        { text_maker("infobase_version_number") }
        <ExternalLink
          href={`https://github.com/TBS-EACPD/infobase/commit/${window.sha}`}
          display={
            <Fragment>
              { ` ${window.sha} ` }
              <IconGitHub inline={true} />
            </Fragment>
          }
        />
        { window.build_date ? ` ${text_maker("infobase_build_date", {build_date: window.build_date})}` : '' }
      </span>
    );
  }
}


export class PageDetails extends React.Component {
  render(){
    return (
      <div className="pagedetails frow">
        <div className="pagedetails__report-a-problem fcol-md-8 fcol-sm-12">
          <Details
            summary_content={text_maker("report_a_problem")}
            content={<EmailFrontend template_name="report_a_problem" />}
            persist_content={true}
          />
        </div>
        <div className="pagedetails__version-number fcol-md-4 fcol-sm-6">
          <VersionNumber />
        </div>
      </div>
    );
  }
}

