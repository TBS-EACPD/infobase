import { Fragment } from 'react';

import { get_client_id } from '../core/analytics.js';
import { create_text_maker } from '../models/text.js';
import {
  get_email_template,
  send_completed_email_template,
} from '../email_backend_utils.js';

import text from './EmailFrontend.yaml';
import './EmailFrontend.scss';

const text_maker = create_text_maker(text);

class EmailFrontend extends React.Component {
  constructor(){
    super();

    this.initial_state = {
      is_loading: true,
      privacy_acknowledged: false,
      has_been_sent: false,
      template: {},
      completed_template: {},
    };

    this.state = this.initial_state;
  }
  render(){
    const {
      is_loading,
      privacy_acknowledged,
      has_been_sent,
      template,
      completed_template,
    } = this.state;

    const all_required_fields_filled = _.chain(template)
      .filter( _.property("required") )
      .keys()
      .every( (required_field_key) => !_.isUndefined(completed_template[required_field_key]) )
      .value();
    const ready_to_send = all_required_fields_filled && privacy_acknowledged;

    return (
      <div className="email-backend-form">
        <form>
          <fieldset>
            {
            //  _.map(
            //    fields,
            //    (field) => (
            //      <Fragment key={`${field.key}`}>
            //        <div key={`${field.key}_check`} className="checkbox">
            //          <label htmlFor={field.text_key}>
            //            <input 
            //              id={field.text_key} 
            //              type="checkbox" 
            //              checked={field.is_checked} 
            //              disabled={has_been_sent}
            //              onChange={
            //                () => {
            //                  const current_field = field;
            //                  this.setState({
            //                    fields: _.map(
            //                      fields,
            //                      (field) => field.key !== current_field.key ?
            //                        field :
            //                        {
            //                          ...field,
            //                          is_checked: !field.is_checked,
            //                        }
            //                    ),
            //                  })
            //                }
            //              }
            //            />
            //            {field.label}
            //          </label>
            //        </div>
            //        { field.is_checked &&
            //          <label key={`${field.key}_text`} className="email-backend-form__text-label">
            //            {text_maker("email_frontend_details")}
            //            <textarea
            //              className="form-control"
            //              maxLength="125"
            //              value={field.additional_detail_input}
            //              disabled={has_been_sent}
            //              onChange={
            //                (event) => {
            //                  const current_field = field;
            //                  this.setState({
            //                    fields: _.map(
            //                      fields,
            //                      (field) => field.key !== current_field.key ?
            //                        field :
            //                        {
            //                          ...field,
            //                          additional_detail_input: event.target.value,
            //                        }
            //                    ),
            //                  });
            //                }
            //              }
            //            />
            //          </label>
            //        }
            //      </Fragment>
            //    )
            //  )
            //}
            //{ any_active_additional_detail_input &&
            //  <div className="email-backend-form__privacy-note">
            //    <p>{text_maker("email_frontend_privacy_note")}</p>
            //    <div className="checkbox">
            //      { any_active_additional_detail_input &&
            //        <label htmlFor={"email_frontend_privacy"}>
            //          <input 
            //            id={"email_frontend_privacy"} 
            //            type="checkbox" 
            //            checked={privacy_acknowledged} 
            //            disabled={has_been_sent}
            //            onChange={ () => this.setState({privacy_acknowledged: !privacy_acknowledged }) }
            //          />
            //          {text_maker("email_frontend_privacy_ack")}
            //        </label>
            //      }
            //    </div>
            //  </div>
            //}
            //<div>
            //  <a href="#privacy" target="_blank" rel="noopener noreferrer">
            //    {text_maker("privacy_title")}
            //  </a>
            //</div>
            //{ !has_been_sent &&
            //  <button 
            //    className="btn-sm btn btn-ib-primary"
            //    disabled={ !ready_to_send }
            //    onClick={ (event) => {
            //      event.preventDefault();
            //      log_standard_event({
            //        SUBAPP: window.location.hash.replace('#',''),
            //        MISC1: "REPORT_A_PROBLEM",
            //        ..._.chain(fields)
            //          .map(
            //            (field, ix) => [
            //              `Q${ix+1}`,
            //              field.is_checked ? field.additional_detail_input || "No details" : "Unchecked",
            //            ]
            //          )
            //          .fromPairs()
            //          .value(),
            //      });
            //      this.setState({has_been_sent: true});
            //    }}
            //  >
            //    {text_maker("email_frontend_send")}
            //  </button>
            }
            { has_been_sent &&
              <Fragment>
                <span tabIndex="0">
                  {text_maker("email_frontend_has_sent")}
                </span>
                <button 
                  className="btn-sm btn btn-ib-primary"
                  style={{float: "right"}}
                  onClick={ (event) => {
                    event.preventDefault();
                    this.setState(this.initial_state);
                  }}
                >
                  {text_maker("email_frontend_reset")}
                </button>
              </Fragment>
            }
          </fieldset>
        </form>
      </div>
    );
  }
}

export { EmailFrontend };