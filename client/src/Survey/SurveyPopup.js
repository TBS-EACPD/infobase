import _ from "lodash";
import React, { Fragment } from "react";

import {
  FixedPopover,
  create_text_maker_component,
} from "src/components/index";

import { log_standard_event } from "src/core/analytics";

import { is_dev, is_dev_link } from "src/core/injected_build_constants";

import { FormFrontend } from "src/FormFrontend";

import { IconFeedback } from "src/icons/icons";
import { tertiaryColor } from "src/style_constants/index";

import text from "./SurveyPopup.yaml";

const { TM, text_maker } = create_text_maker_component(text);

const POSTPONE_TIMEOUT_PERIOD = 1000 * 60 * 60 * 12;

const currentDate = new Date();

const is_survey_campaign_period = (() => {
  // Reminder: months are 0-indexed, years and days aren't
  const is_start_of_trimester = _.includes([0, 4, 8], currentDate.getMonth());

  const is_second_half_of_month = currentDate.getDate() > 14;

  return is_start_of_trimester && is_second_half_of_month;
})();

// Note: suffix based on year and month to bust cached settings between current, and potential future, campaign periods
const key_suffix = `--${currentDate.getFullYear()}-${currentDate.getMonth()}`;
const postponed_since_storage_key =
  "infobase_survey_popup_postponed_since" + key_suffix;
const is_deactivated_storage_key =
  "infobase_survey_popup_deactivated" + key_suffix;

export class SurveyPopup extends React.Component {
  constructor(props) {
    super(props);

    const is_deactivated_storage_value = localStorage.getItem(
      is_deactivated_storage_key
    );
    const is_deactivated_by_user = is_deactivated_storage_value === "true";

    const postponed_since_storage_value = localStorage.getItem(
      postponed_since_storage_key
    );
    const is_postponed_by_user = !_.isNull(postponed_since_storage_value)
      ? Date.now() - +postponed_since_storage_value >= POSTPONE_TIMEOUT_PERIOD
      : false;

    const show_popup =
      !(is_dev || is_dev_link) &&
      is_survey_campaign_period &&
      !is_deactivated_by_user &&
      !is_postponed_by_user;

    this.state = {
      show_popup,
    };
  }

  handlePopupButtonPress = (button_type) => {
    log_standard_event({
      SUBAPP: window.location.pathname,
      MISC1: "SURVEY_POPUP",
      MISC2: `interaction: ${button_type}`,
    });

    if (_.includes(["yes", "no", "short_survey_submitted"], button_type)) {
      localStorage.setItem(is_deactivated_storage_key, "true");
    } else if (button_type === "later") {
      localStorage.setItem(is_deactivated_storage_key, "false");
      localStorage.setItem(postponed_since_storage_key, Date.now());
    }

    this.setState({ show_popup: false });
  };

  render() {
    const { show_popup } = this.state;

    if (!show_popup) {
      return null;
    }

    return (
      <FixedPopover
        show={show_popup}
        title={
          <Fragment>
            <IconFeedback
              aria_label={text_maker("suvey_popup_header")}
              color={tertiaryColor}
              alternate_color={false}
            />
            {text_maker("suvey_popup_header")}
          </Fragment>
        }
        body={
          <Fragment>
            <div
              style={{
                fontSize: "0.9em",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <TM k="survey_popup_body" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
              <a
                className="link-unstyled btn btn-ib-primary"
                onClick={() => this.handlePopupButtonPress("yes")}
                target="_blank"
                rel="noopener noreferrer"
                href={"#survey"}
              >
                {text_maker(`survey_popup_yes`)}
              </a>
            </div>
            <div
              className="mrgn-tp-md"
              style={{
                fontSize: "0.9em",
                display: "flex",
                flexDirection: "column",
                textAlign: "left",
                borderTop: "1px solid #e5e5e5",
              }}
            >
              <TM
                k="simplified_survey_header"
                style={{ alignSelf: "center", fontSize: "1.4em" }}
              />
              <FormFrontend
                template_name="feedback_simplified"
                include_privacy={false}
                top_border={false}
                on_submitted={() =>
                  this.handlePopupButtonPress("short_survey_submitted")
                }
              />
            </div>
          </Fragment>
        }
        footer={
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-evenly",
            }}
          >
            {_.map(["later", "no"], (button_type) => (
              <button
                key={button_type}
                className="btn btn-ib-primary"
                onClick={() => this.handlePopupButtonPress(button_type)}
              >
                {text_maker(`survey_popup_${button_type}`)}
              </button>
            ))}
          </div>
        }
      />
    );
  }
}
