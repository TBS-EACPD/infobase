import classNames from "classnames";
import { Fragment } from "react";

import { get_client_id, log_standard_event } from "../core/analytics.js";

import { has_local_storage } from "../core/feature_detection.js";
import {
  get_email_template,
  send_completed_email_template,
} from "../email_backend_utils.js";

import { CheckBox } from "./CheckBox.js";
import { create_text_maker_component } from "./misc_util_components.js";
import { SpinnerWrapper } from "./SpinnerWrapper";

import text from "./EmailFrontend.yaml";

import "./EmailFrontend.scss";

const { TM, text_maker } = create_text_maker_component(text);

const get_values_for_automatic_fields = (automatic_fields) => {
  const automatic_field_getters = {
    sha: () => window.sha,
    route: () => window.location.hash.replace("#", "") || "start",
    lang: () => window.lang,
    app_version: () => (window.is_a11y_mode ? "a11y" : "standard"),
    client_id: () => get_client_id(),
    additional: () => ({}),
  };

  return _.mapValues(
    automatic_fields,
    (value, key) =>
      _.isFunction(automatic_field_getters[key]) &&
      automatic_field_getters[key]()
  );
};

const EnumField = ({
  form_type,
  label,
  enum_key,
  field_id,
  selected_enums_for_field,
  disabled,
  state_update_callback,
  classes,
}) => (
  <div className={`${form_type} ${classes}`}>
    <label htmlFor={`${field_id}--${enum_key}`}>
      <input
        id={`${field_id}--${enum_key}`}
        type={form_type}
        checked={_.includes(selected_enums_for_field, enum_key)}
        disabled={disabled}
        onChange={() => {
          state_update_callback(
            form_type === "radio"
              ? [enum_key]
              : _.chain(selected_enums_for_field).xor([enum_key]).sort().value()
          );
        }}
      />
      {label}
    </label>
  </div>
);

const get_field_id = (field_key) => `email_frontend_${field_key}`;

class EmailFrontend extends React.Component {
  constructor(props) {
    super(props);

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
  componentDidMount() {
    get_email_template(this.state.template_name).then((template) => {
      this.setState({ loading: false, template: template });
    });
  }
  componentDidUpdate() {
    const {
      sent_to_backend,
      awaiting_backend_response,
      backend_response,

      template_name,
      template,
      completed_template,
    } = this.state;

    // complete automatic fields and send completed tempalte to backend after submit button is clicked
    if (awaiting_backend_response && !sent_to_backend) {
      const automatic_fields = _.omitBy(
        template,
        ({ form_type }, key) => key === "meta" || form_type
      );

      const values_for_automatic_fields = get_values_for_automatic_fields(
        automatic_fields
      );

      send_completed_email_template(template_name, {
        ...completed_template,
        ...values_for_automatic_fields,
      }).then((backend_response) =>
        this.setState({
          awaiting_backend_response: false,
          backend_response,
        })
      );

      this.setState({ sent_to_backend: true });
    }

    // log server response to submitted completed template
    if (!awaiting_backend_response && sent_to_backend) {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", "") || "start",
        MISC1: "EMAIL_FRONTEND",
        MISC2: `${template_name}: ${backend_response.error_message}`,
      });
    }
  }
  mergeIntoCompletedTemplateState = (key, value) => {
    const connected_fields = _.chain(this.state.template)
      .toPairs()
      .filter(([field_name, field_val]) =>
        _.includes(_.keys(field_val), "connection")
      )
      .value();
    const reset_field = _.filter(
      connected_fields,
      ([field_name, field_val]) =>
        field_val.connection.name === key &&
        !_.includes(value, field_val.connection.enable)
    );
    const reset_key = !_.isEmpty(reset_field) ? reset_field[0][0] : null;

    if (!reset_key) {
      this.setState({
        completed_template: {
          ...this.state.completed_template,
          [key]: value,
        },
      });
    } else {
      this.setState({
        completed_template: {
          ...this.state.completed_template,
          [key]: value,
          [reset_key]: "",
        },
      });
    }
  };
  render() {
    const {
      loading,
      privacy_acknowledged,
      sent_to_backend,
      awaiting_backend_response,
      backend_response,
      template,
      completed_template,
    } = this.state;

    const { top_border } = this.props;

    const user_fields = _.omitBy(
      template,
      ({ form_type }, key) => key === "meta" || !form_type
    );

    const all_required_user_fields_are_filled = _.chain(user_fields)
      .omitBy((field) => !field.required)
      .keys()
      .every(
        (required_field_key) =>
          !_.isUndefined(completed_template[required_field_key]) &&
          !_.isEmpty(completed_template[required_field_key])
      )
      .value();

    const all_connected_user_fields_are_filled = _.chain(user_fields)
      .toPairs()
      .filter(([field_name, field_val]) =>
        _.includes(_.keys(field_val), "connection")
      )
      .filter(
        ([field_name, field_val]) =>
          _.includes(_.keys(completed_template), field_val.connection.name) &&
          _.includes(
            completed_template[field_val.connection.name],
            field_val.connection.enable
          )
      )
      .every(
        ([field_name, field_val]) => !_.isEmpty(completed_template[field_name])
      )
      .value();

    const ready_to_send =
      all_required_user_fields_are_filled &&
      all_connected_user_fields_are_filled &&
      privacy_acknowledged &&
      (!sent_to_backend || // hasn't been submitted yet
        (sent_to_backend &&
          !_.isEmpty(backend_response) &&
          !backend_response.success)); // submitted, but received a failing response, allow for retrys

    const disable_forms =
      (sent_to_backend && backend_response.success) ||
      awaiting_backend_response;

    const get_form_for_user_field = (field_info, field_key) => {
      switch (field_info.form_type) {
        case "checkbox":
        case "radio":
          return (
            <fieldset style={{ marginBottom: "1rem" }}>
              <legend>{field_info.form_label[window.lang]}</legend>
              {_.map(field_info.enum_values, (label_by_lang, key) => (
                <EnumField
                  classes={
                    field_info.style && field_info.style === "horizontal"
                      ? `col-sm-${_.floor(
                          12 / _.size(field_info.enum_values)
                        )} inline`
                      : ""
                  }
                  key={`${key}_${field_info.form_type}`}
                  form_type={field_info.form_type}
                  label={label_by_lang[window.lang]}
                  enum_key={key}
                  field_id={get_field_id(field_key)}
                  selected_enums_for_field={completed_template[field_key]}
                  disabled={disable_forms}
                  state_update_callback={(selected_enums) =>
                    this.mergeIntoCompletedTemplateState(
                      field_key,
                      selected_enums
                    )
                  }
                />
              ))}
            </fieldset>
          );
        case "textarea":
          return (
            <Fragment>
              <label htmlFor={get_field_id(field_key)}>
                {field_info.form_label[window.lang]}
              </label>
              <textarea
                style={{ marginBottom: "1rem" }}
                id={get_field_id(field_key)}
                disabled={
                  disable_forms ||
                  (field_info.connection &&
                    !_.includes(
                      completed_template,
                      field_info.connection.name
                    ) &&
                    !_.includes(
                      completed_template[field_info.connection.name],
                      field_info.connection.enable
                    ))
                }
                rows="5"
                cols="33"
                defaultValue={completed_template[field_key] || ""}
                onChange={_.debounce(
                  () =>
                    this.mergeIntoCompletedTemplateState(
                      field_key,
                      document.getElementById(`${get_field_id(field_key)}`)
                        .value
                    ),
                  250
                )}
              />
            </Fragment>
          );
        case "error":
          return <label>{field_info.form_label[window.lang]}</label>;
      }
    };

    return (
      <div
        style={top_border ? {} : { borderTop: "none" }}
        className="email-backend-form"
      >
        {loading && (
          <div style={{ height: "50px" }}>
            <SpinnerWrapper config_name="small_inline" />
          </div>
        )}
        {!loading && (
          <form>
            <fieldset>
              {_.map(user_fields, (field_info, key) => (
                <div
                  key={`${`${key}_form`}`}
                  className={`email-backend-form__${field_info.form_type}`}
                >
                  {get_form_for_user_field(field_info, key)}
                </div>
              ))}
              <div className="email-backend-form__privacy-note">
                <TM k="email_frontend_privacy_note" />
                <div style={{ textAlign: "center" }}>
                  <CheckBox
                    id={"email_frontend_privacy"}
                    active={privacy_acknowledged}
                    disabled={disable_forms}
                    onClick={() =>
                      this.setState({
                        privacy_acknowledged: !privacy_acknowledged,
                      })
                    }
                    label={text_maker("email_frontend_privacy_ack")}
                    label_style={{ fontWeight: "bold" }}
                    container_style={{ justifyContent: "center" }}
                  />
                </div>
              </div>
              {
                <button
                  className={classNames(
                    "btn-sm btn btn-ib-primary",
                    awaiting_backend_response &&
                      "email-backend-form__send-btn--sending"
                  )}
                  style={{ width: "100%" }}
                  disabled={!ready_to_send}
                  onClick={(event) => {
                    event.preventDefault();
                    if (
                      this.state.template_name === "feedback" &&
                      has_local_storage
                    ) {
                      localStorage.setItem(
                        `infobase_survey_popup_deactivated`,
                        "true"
                      );
                      localStorage.setItem(
                        `infobase_survey_popup_deactivated_since`,
                        Date.now()
                      );
                    }
                    this.setState({
                      awaiting_backend_response: true,
                      backend_response: {},
                    });
                  }}
                  aria-label={
                    (sent_to_backend &&
                      (awaiting_backend_response
                        ? text_maker("email_frontend_sending")
                        : text_maker("email_frontend_sent"))) ||
                    text_maker("email_frontend_send")
                  }
                >
                  {!awaiting_backend_response &&
                    text_maker("email_frontend_send")}
                  {awaiting_backend_response && (
                    <SpinnerWrapper config_name="small_inline" />
                  )}
                </button>
              }
              {sent_to_backend && awaiting_backend_response && (
                <p aria-live="polite" className="sr-only">
                  {text_maker("email_frontend_sending")}
                </p>
              )}
              {sent_to_backend && !awaiting_backend_response && (
                <Fragment>
                  {backend_response.success && (
                    <Fragment>
                      <p aria-live="polite">
                        {text_maker("email_frontend_has_sent_success")}
                      </p>
                      <button
                        className="btn-sm btn btn-ib-primary"
                        style={{ float: "right" }}
                        onClick={(event) => {
                          event.preventDefault();

                          _.chain(user_fields)
                            .pickBy(({ form_type }) => form_type === "textarea")
                            .forEach(
                              (field_info, key) =>
                                (document.getElementById(
                                  get_field_id(key)
                                ).value = "")
                            )
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
                  )}
                  {!backend_response.success && (
                    <Fragment>
                      <div aria-live="polite">
                        <TM k="email_frontend_has_sent_failed" el="p" />
                        {backend_response.error_message}
                      </div>
                    </Fragment>
                  )}
                </Fragment>
              )}
            </fieldset>
          </form>
        )}
      </div>
    );
  }
}

export { EmailFrontend };

EmailFrontend.defaultProps = {
  top_border: true,
};
