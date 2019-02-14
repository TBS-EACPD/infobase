import './PageDetails.scss';
import text from './PageDetails.yaml';
import { Details } from './Details.js';
import { create_text_maker } from '../models/text.js';
import { log_standard_event } from '../core/analytics.js';

const text_maker = create_text_maker(text);

const report_a_problem_field_text_keys = [
  "report_a_problem",
];

class ReportAProblem extends React.Component {
  constructor(){
    super();

    this.state = {
      has_been_sent: false,
      fields: _.map(
        report_a_problem_field_text_keys,
        (text_key) => ({
          key: text_key,
          label: text_maker(text_key),
          is_checked: false,
          additional_details: "",
        })
      ),
    };
  }
  render(){
    const {
      has_been_sent,
      fields,
    } = this.state;

    return (
      <Details
        summary_content={text_maker("report_a_problem")}
        content={
          <div className="report-a-problem-menu">
            <form>
              <legend 
                style={{
                  borderBottom: "none",
                  marginBottom: "0px",
                }}
              >
                {text_maker("report_a_problem_legend")}
              </legend>
              <fieldset>
                {
                  _.map(
                    fields,
                    (field) => (
                      <div className="checkbox">
                        <label key={field.text_key} htmlFor={field.text_key}>
                          <input 
                            id={field.text_key} 
                            type="checkbox" 
                            checked={field.is_checked} 
                            disabled={has_been_sent}
                            onChange={
                              () => {
                                const current_field = field;

                                this.setState({
                                  has_been_sent,
                                  fields: _.map(
                                    fields,
                                    (field) => field.key !== current_field.key ?
                                      field :
                                      {
                                        ...field,
                                        is_checked: !field.is_checked,
                                      }
                                  ),
                                })
                              }
                            }
                          />
                          {field.label}
                        </label>
                        { field.is_checked &&
                          <div>
                            TODO: text field for additional info
                          </div> 
                        }
                      </div>
                    )
                  )
                }
                <div>
                  TODO: send button, deactivated after having been sent
                </div> 
                { has_been_sent &&
                  <div>
                    TODO: reset button
                  </div>
                }
              </fieldset>
            </form>
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
        <div className="pagedetails__report-a-problem col-sm-6 col-lg-5">
          <ReportAProblem />
        </div>
        <div className="pagedetails__version-number">
          <VersionNumber />
        </div>
      </div>
    );
  }
}

