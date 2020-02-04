import { Fragment } from 'react';
import classNames from 'classnames';

import { create_text_maker_component } from './misc_util_components.js';
import { SpinnerWrapper } from './SpinnerWrapper';
import { CheckBox } from './CheckBox.js';

import { 
  get_client_id,
  log_standard_event,
} from '../core/analytics.js';
import {
  get_email_template,
  send_completed_email_template,
} from '../email_backend_utils.js';

import text from './EmailFrontend.yaml';
import './EmailFrontend.scss';

const { TM, text_maker } = create_text_maker_component(text);


const get_values_for_automatic_fields = (automatic_fields) => {
  const automatic_field_getters = {
    sha: () => window.sha,
    route: () => window.location.hash.replace('#','') || "start",
    lang: () => window.lang,
    app_version: () => window.is_a11y_mode ? "a11y" : "standard",
    client_id: () => get_client_id(),
    additional: () => ({}),
  };

  return _.mapValues(
    automatic_fields,
    (value, key) => _.isFunction(automatic_field_getters[key]) && automatic_field_getters[key]()
  );
};

class EmailFrontend extends React.Component {
  constructor(props){
    super(props);

    this.mergeIntoCompletedTemplateState = (key, value) => this.setState({
      completed_template: {
        ...this.state.completed_template,
        [key]: value,
      },
    });

    this.state = {
      template_name: props.template_name,
      loading: true,
      privacy_acknowledged: false,
      sent_to_backend: false,
      awaiting_backend_response: false,
      backend_response: {},
      template: {},
      completed_template: {},
    };
  }
  componentDidMount(){
    get_email_template(this.state.template_name)
      .then( (template) => this.setState({loading: false, template: template}) );
  }
  componentDidUpdate(){
    const {
      sent_to_backend,
      awaiting_backend_response,
      backend_response,

      template_name,
      template,
      completed_template,
    } = this.state;

    // complete automatic fields and send completed tempalte to backend after submit button is clicked
    if (awaiting_backend_response && !sent_to_backend){
      const automatic_fields = _.omitBy(template, ({form_type}, key) => key === "meta" || form_type);

      const values_for_automatic_fields = get_values_for_automatic_fields(automatic_fields);

      send_completed_email_template(
        template_name,
        {...completed_template, ...values_for_automatic_fields },
      ).then( (backend_response) => this.setState({
        awaiting_backend_response: false,
        backend_response,
      }) );

      this.setState({sent_to_backend: true});
    }

    // log server response to submitted completed template
    if (!awaiting_backend_response && sent_to_backend){
      log_standard_event({
        SUBAPP: window.location.hash.replace('#','') || "start",
        MISC1: "EMAIL_FRONTEND",
        MISC2: `${template_name}: ${backend_response.error_message}`,
      });
    }
  }
  render(){
    const {
      loading,
      privacy_acknowledged,
      sent_to_backend,
      awaiting_backend_response,
      backend_response,
      template,
      completed_template,
    } = this.state;

    const user_fields = _.omitBy(template, ({form_type}, key) => key === "meta" || !form_type);

    const all_required_user_fields_are_filled = _.chain(user_fields)
      .omitBy( (field) => !field.required )
      .keys()
      .every( (required_field_key) => 
        (
          !_.isUndefined(completed_template[required_field_key]) && 
          !_.isEmpty(completed_template[required_field_key]) 
        )
      )
      .value();
    const ready_to_send = all_required_user_fields_are_filled && privacy_acknowledged && (
      !sent_to_backend || // hasn't been submitted yet
      (sent_to_backend && !_.isEmpty(backend_response) && !backend_response.success) // submitted, but received a failing response, allow for retrys
    );

    const disable_forms = (sent_to_backend && backend_response.success) || awaiting_backend_response;


    const get_field_id = (field_key) => `email_frontend_${field_key}`;
    const get_form_for_user_field = (field_info, field_key) => {
      switch(field_info.form_type){
        case 'checkbox':
          return (
            <fieldset>
              <legend>{field_info.form_label[window.lang]}</legend>
              { _.map(
                field_info.enum_values, (label_by_lang, key) => 
                  <CheckBox
                    style={{padding: 5}}
                    key={`${key}_check`}
                    id={get_field_id(key)}
                    disabled={disable_forms}
                    active={_.includes(completed_template[field_key], key)}
                    label={label_by_lang[window.lang]}
                    onClick={() => {
                      this.mergeIntoCompletedTemplateState(
                        field_key,
                        _.chain(completed_template[field_key])
                          .xor([key])
                          .sort()
                          .value()
                      );
                    }}
                  />
              )}
            </fieldset>
          );
        case 'textarea':
          return (
            <Fragment>
              <label htmlFor={get_field_id(field_key)}>
                {field_info.form_label[window.lang]}
              </label>
              <textarea
                id={get_field_id(field_key)}
                disabled={disable_forms}
                rows="5"
                cols="33"
                defaultValue={completed_template[field_key] || ''}
                onChange={
                  _.debounce(
                    () => this.mergeIntoCompletedTemplateState(
                      field_key,
                      document.getElementById(`${get_field_id(field_key)}`).value
                    ),
                    250
                  )
                }
              />
            </Fragment>
          );
        case 'error':
          return (
            <label>
              {field_info.form_label[window.lang]}
            </label>
          );
      }
    };
 
 
    return (
      <div className="email-backend-form">
        { loading && 
          <div style={{height: "50px"}}>
            <SpinnerWrapper config_name="small_inline" />
          </div>
        }
        { !loading &&
          <form>
            <fieldset>
              {
                _.map(
                  user_fields,
                  (field_info, key) => (
                    <div key={`${`${key}_form`}`} className={`email-backend-form__${field_info.form_type}`}>
                      { get_form_for_user_field(field_info, key) }
                    </div>
                  )
                )
              }
              <div className="email-backend-form__privacy-note">
                <TM k="email_frontend_privacy_note" />
                <div style={{textAlign: 'center'}}>
                  <CheckBox 
                    id={"email_frontend_privacy"} 
                    active={privacy_acknowledged} 
                    disabled={disable_forms}
                    onClick={ () => this.setState({privacy_acknowledged: !privacy_acknowledged }) }
                    label={text_maker("email_frontend_privacy_ack")}
                    label_style={{fontWeight: 'bold'}}
                  />
                </div>
              </div>
              {
                <button 
                  className={classNames("btn-sm btn btn-ib-primary", awaiting_backend_response && "email-backend-form__send-btn--sending")}
                  style={{width: "100%"}}
                  disabled={ !ready_to_send }
                  onClick={(event) => {
                    event.preventDefault();
                    this.setState({ awaiting_backend_response: true, backend_response: {} });
                  }}
                  aria-label={
                    sent_to_backend && (
                      awaiting_backend_response ?
                        text_maker("email_frontend_sending") :
                        text_maker("email_frontend_sent")
                    ) || text_maker("email_frontend_send")
                  }
                >
                  { !awaiting_backend_response && text_maker("email_frontend_send") }
                  { awaiting_backend_response && <SpinnerWrapper config_name="small_inline" /> }
                </button>
              }
              { sent_to_backend && awaiting_backend_response &&
                <p aria-live="polite" className="sr-only">
                  {text_maker("email_frontend_sending")}
                </p>
              }
              { sent_to_backend && !awaiting_backend_response &&
                <Fragment>
                  { backend_response.success &&
                    <Fragment>
                      <p aria-live="polite">
                        {text_maker("email_frontend_has_sent_success")}
                      </p>
                      <button
                        className="btn-sm btn btn-ib-primary"
                        style={{float: "right"}}
                        onClick={(event) => {
                          event.preventDefault();

                          _.chain(user_fields)
                            .pickBy( ({form_type}) => form_type === "textarea")
                            .forEach( (field_info, key) => document.getElementById( get_field_id(key) ).value = '' )
                            .value();

                          this.setState({
                            ...this.state,
                            sent_to_backend: false,
                            awaiting_backend_response: false,
                            backend_response: {},
                            completed_template: {},
                          });
                        }}
                      >
                        {text_maker("email_frontend_reset")}
                      </button>
                    </Fragment>
                  }
                  { !backend_response.success &&
                    <Fragment>
                      <div aria-live="polite">
                        <TM k="email_frontend_has_sent_failed" el="p"/>
                        {backend_response.error_message}
                      </div>
                    </Fragment>
                  }
                </Fragment>
              }
            </fieldset>
          </form>
        }
      </div>
    );
  }
}

export { EmailFrontend };