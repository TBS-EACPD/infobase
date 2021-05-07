import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { get_client_id, log_standard_event } from "src/core/analytics.js";

import { textRed } from "src/core/color_defs.ts";
import { has_local_storage } from "src/core/feature_detection.ts";
import { is_a11y_mode, lang, sha } from "src/core/injected_build_constants.ts";

import {
  get_email_template,
  send_completed_email_template,
} from "src/email_backend_utils.js";

import { CheckBox } from "./CheckBox/CheckBox.js";
import { create_text_maker_component } from "./misc_util_components.js";

import { SpinnerWrapper } from "./SpinnerWrapper.js";

import text from "./EmailFrontend.yaml";

import "./EmailFrontend.scss";

const { TM, text_maker } = create_text_maker_component(text);

const get_values_for_automatic_fields = (automatic_fields) => {
  const automatic_field_getters = {
    sha: () => sha,
    route: () => window.location.hash.replace("#", "") || "start",
    lang: () => lang,
    app_version: () => (is_a11y_mode ? "a11y" : "standard"),
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
}) => (
  <div className={form_type}>
    <label htmlFor={`${field_id}--${enum_key}`}>
      <input
        id={`${field_id}--${enum_key}`}
        style={{ marginRight: "10px" }}
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

    this.mergeIntoCompletedTemplateState = (key, value) =>
      this.setState({
        completed_template: {
          ...this.state.completed_template,
          [key]: value,
        },
      });

    this.state = {
      template_name: props.template_name,
      loading: true,
      privacy_acknowledged: !props.include_privacy,
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

    // need to track mounted state, to avoid potentially setting state on an unmounted component after the backend response
    this._is_mounted = true;
  }
  componentWillUnmount() {
    this._is_mounted = false;
  }
  componentDidUpdate() {
    const {
      sent_to_backend,
      awaiting_backend_response,

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
      }).then((backend_response) => {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", "") || "start",
          MISC1: "EMAIL_FRONTEND",
          MISC2: `${template_name}: ${backend_response.error_message}`,
        });

        this._is_mounted &&
          this.setState({
            awaiting_backend_response: false,
            backend_response,
          });
      });

      this.setState({ sent_to_backend: true });
    } else if (awaiting_backend_response && sent_to_backend) {
      this.props.on_submitted();
    }
  }
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

    const { include_privacy } = this.props;

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
      .filter(
        ([field_name, field_val]) =>
          _.includes(_.keys(field_val), "connection") &&
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
              <legend>
                {field_info.form_label[lang]}
                {field_info.required && (
                  <span style={{ color: textRed }}>*</span>
                )}
              </legend>
              <div
                className={classNames({
                  "d-flex justify-content-between":
                    field_info.style && field_info.style === "horizontal",
                })}
              >
                {_.map(field_info.enum_values, (label_by_lang, key) => {
                  return (
                    <EnumField
                      key={`${key}_${field_info.form_type}`}
                      form_type={field_info.form_type}
                      label={label_by_lang[lang]}
                      enum_key={key}
                      field_id={get_field_id(field_key)}
                      selected_enums_for_field={completed_template[field_key]}
                      disabled={disable_forms}
                      aria-hidden={disable_forms}
                      state_update_callback={(selected_enums) =>
                        this.mergeIntoCompletedTemplateState(
                          field_key,
                          selected_enums
                        )
                      }
                    />
                  );
                })}
              </div>
            </fieldset>
          );
        case "textarea": {
          const connected_required = //handles red star alerting required
            field_info.connection &&
            _.includes(
              _.keys(completed_template),
              field_info.connection.name
            ) &&
            _.includes(
              completed_template[field_info.connection.name],
              field_info.connection.enable
            );

          const connected_disabled = //handles disabled for textarea
            field_info.connection &&
            !_.includes(completed_template, field_info.connection.name) &&
            !_.includes(
              completed_template[field_info.connection.name],
              field_info.connection.enable
            );
          return (
            <Fragment>
              <label htmlFor={get_field_id(field_key)}>
                {field_info.form_label[lang]}
                {connected_required && (
                  <span style={{ color: textRed }}>*</span>
                )}
              </label>
              <textarea
                style={{ marginBottom: "1rem" }}
                id={get_field_id(field_key)}
                disabled={disable_forms || connected_disabled}
                aria-hidden={disable_forms || connected_disabled}
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
        }
        case "error":
          return <label>{field_info.form_label[lang]}</label>;
      }
    };

    return (
      <div className="email-backend-form">
        {loading && (
          <div style={{ height: "100px", position: "relative" }}>
            <SpinnerWrapper config_name="tabbed_content" />
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
              {include_privacy && (
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
              )}
              {
                <button
                  className={classNames(
                    "btn-sm btn btn-ib-primary",
                    awaiting_backend_response &&
                      "email-backend-form__send-btn--sending"
                  )}
                  title={text_maker("email_frontend_required")}
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
  include_privacy: true,
  on_submitted: _.noop,
};
