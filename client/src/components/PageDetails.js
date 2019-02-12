import text from './PageDetails.yaml'
import { create_text_maker } from '../models/text.js';
import { log_standard_event } from '../core/analytics.js';

const text_maker = create_text_maker(text);

class ReportAProblem extends React.Component {
  constructor(){
    super();
  }
  render(){
    return null;
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
  constructor(){
    super();
  }
  render(){
    return (
      <div className="pagedetails">
        <ReportAProblem />
        <VersionNumber />
      </div>
    );
  }
}

