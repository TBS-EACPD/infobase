import text from './PageDetails.yaml'
import { create_text_maker_component } from '../util_components.js';
import { log_standard_event } from '../core/analytics.js';

const { TM } = create_text_maker_component(text);

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
      <dl id="wb-dtmd">
        <dt>
          TODO: Version number:
        </dt>
        <dd>
          {`${window.sha} (TODO: Released: ${"TODO: set date during builds?"})`}
        </dd>
      </dl>
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

