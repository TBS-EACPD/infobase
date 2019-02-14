import './PageDetails.scss';
import text from './PageDetails.yaml';
import { Details } from './Details.js';
import { create_text_maker } from '../models/text.js';
import { log_standard_event } from '../core/analytics.js';
import { Fragment } from 'react';

const text_maker = create_text_maker(text);

const report_a_problem_field_text_keys = _.chain()
  .range(6)
  .map(number => `report_a_problem_option_${number+1}`)
  .value();

class ReportAProblem extends React.Component {
  constructor(){
    super();

    this.initial_state = { 
      has_been_sent: false,
      fields: _.map(
        report_a_problem_field_text_keys,
        (text_key) => ({
          key: text_key,
          label: text_maker(text_key),
          is_checked: false,
          additional_detail_input: "",
        })
      ),
    };

    this.state = this.initial_state;
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
                      <Fragment key={`${field.key}`}>
                        <div key={`${field.key}_check`} className="checkbox">
                          <label htmlFor={field.text_key}>
                            <input 
                              id={field.text_key} 
                              type="checkbox" 
                              checked={field.is_checked} 
                              disabled={has_been_sent}
                              onChange={
                                () => {
                                  const current_field = field;
                                  this.setState({
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
                        </div>
                        { field.is_checked &&
                          <label key={`${field.key}_text`} className="report-a-problem-menu__text-label">
                            {text_maker("report_a_problem_details")}
                            <textarea
                              className="form-control"
                              value={field.additional_detail_input}
                              disabled={has_been_sent}
                              onChange={
                                (event) => {
                                  const current_field = field;
                                  this.setState({
                                    fields: _.map(
                                      fields,
                                      (field) => field.key !== current_field.key ?
                                        field :
                                        {
                                          ...field,
                                          additional_detail_input: event.target.value,
                                        }
                                    ),
                                  });
                                }
                              }
                            />
                          </label>
                        }
                      </Fragment>
                    )
                  )
                }
                <button 
                  className="btn-sm btn btn-ib-primary"
                  disabled={has_been_sent}
                  onClick={ (event) => {
                    event.preventDefault();
                    log_standard_event({
                      SUBAPP: window.location.hash.replace('#',''),
                      MISC1: "REPORT_A_PROBLEM",
                      ..._.chain(fields)
                        .map(
                          (field, ix) => [
                            `Q${ix+1}`,
                            field.is_checked ? field.additional_detail_input || "No details" : "Unchecked",
                          ]
                        )
                        .fromPairs()
                        .value(),
                    });
                    this.setState({has_been_sent: true});
                  }}
                >
                  {text_maker(!has_been_sent ? "report_a_problem_send" : "report_a_problem_has_sent")}
                </button> 
                { has_been_sent &&
                  <button 
                    className="btn-sm btn btn-ib-primary"
                    style={{float: "right"}}
                    onClick={ (event) => {
                      event.preventDefault();
                      this.setState(this.initial_state);
                    }}
                  >
                    {text_maker("report_a_problem_reset")}
                  </button>
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

