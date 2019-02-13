import './PageDetails.scss';
import text from './PageDetails.yaml';
import { Details } from './Details.js';
import { create_text_maker } from '../models/text.js';
import { log_standard_event } from '../core/analytics.js';

const text_maker = create_text_maker(text);

class ReportAProblem extends React.Component {
  constructor(){
    super();
  }
  render(){
    return (
      <Details
        summary_content={text_maker("report_a_problem")}
        content={
          <div>
            TODO
          </div>
        }
      />
    );
  }
}

class VersionNumber extends React.Component {
  render(){
    return (
      <span>
        {
          `${
            text_maker("infobase_version_number")
          } ${
            window.sha
          } ${
            window.build_date && 
              text_maker("infobase_build_date", {build_date: window.build_date}) 
          }`
        }
      </span>
    );
  }
}


export class PageDetails extends React.Component {
  render(){
    return (
      <div className="pagedetails">
        <div className="pagedetails__report-a-problem col-sm-6 col-md-5 col-lg-4">
          <ReportAProblem />
        </div>
        <div className="pagedetails__version-number">
          <VersionNumber />
        </div>
      </div>
    );
  }
}

