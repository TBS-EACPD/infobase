import _ from "lodash";
import React, { Fragment } from "react";
import { withRouter } from "react-router";

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

const currentDate = new Date();

const get_path_root = (path) =>
  _.chain(path).replace(/^\//, "").split("/").first().value();

const is_survey_campaign_ongoing = () => {
  if (is_dev || is_dev_link) {
    return false;
  }

  // Reminder: months are 0-indexed, years and days aren't
  const is_start_of_trimester = _.includes([0, 4, 8], currentDate.getMonth());

  const is_second_half_of_month = currentDate.getDate() > 14;

  return is_start_of_trimester && is_second_half_of_month;
};

const key_suffix = `--${currentDate.getFullYear()}-${currentDate.getMonth()}`;
const postponed_since_storage_key =
  "infobase_survey_popup_postponed_since" + key_suffix;
const is_deactivated_storage_key =
  "infobase_survey_popup_deactivated" + key_suffix;
const page_visit_count_storage_key =
  "infobase_survey_popup_page_visit_count" + key_suffix;

const get_state_defaults = () => {
  const postponed_since = localStorage.getItem(postponed_since_storage_key);
  const is_deactivated = localStorage.getItem(is_deactivated_storage_key);
  const page_visit_count = localStorage.getItem(page_visit_count_storage_key);

  const milliseconds_in_a_day = 1000 * 60 * 60 * 24;
  const is_currently_postponed = !_.isNull(postponed_since)
    ? Date.now() - +postponed_since >= milliseconds_in_a_day
    : false;

  return {
    active:
      !is_currently_postponed &&
      (!_.isNull(is_deactivated) ? is_deactivated !== "true" : true),
    page_visit_count: !_.isNull(page_visit_count) ? +page_visit_count : 1,
  };
};

export const SurveyPopup = withRouter(
  class _SurveyPopup extends React.Component {
    constructor(props) {
      super(props);

      props.history.listen(({ pathname }) => {
        if (
          this.state.active &&
          this.state.previous_path_root !== get_path_root(pathname)
        ) {
          const new_page_visit_count = this.state.page_visit_count + 1;

          localStorage.setItem(
            page_visit_count_storage_key,
            new_page_visit_count
          );

          this.setState({
            page_visit_count: new_page_visit_count,
            previous_path_root: get_path_root(pathname),
          });
        }
      });

      const { active, page_visit_count } = get_state_defaults();

      this.state = {
        active: active,
        page_visit_count: page_visit_count,
        previous_path_root: null,
      };
    }

    handleButtonPress = (button_type) => {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", "") || "start",
        MISC1: "SURVEY_POPUP",
        MISC2: `interaction: ${button_type}`,
      });

      if (_.includes(["yes", "no", "short_survey_submitted"], button_type)) {
        localStorage.setItem(is_deactivated_storage_key, "true");
      } else if (button_type === "later") {
        localStorage.setItem(postponed_since_storage_key, Date.now());
      }

      this.setState({ active: false });
    };

    static getDerivedStateFromProps(props) {
      if (props.showSurvey) {
        return { active: false };
      }

      return null;
    }

    shouldComponentUpdate(_nextProps, nextState) {
      const page_changed =
        this.state.page_visit_count !== nextState.page_visit_count;
      const is_closing = this.state.active !== nextState.active;

      return page_changed || is_closing;
    }

    render() {
      const { active, page_visit_count } = this.state;

      const should_show =
        is_survey_campaign_ongoing() && active && page_visit_count >= 4;

      if (should_show) {
        clearTimeout(this.timeout);
        this.timeout = null;
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", "") || "start",
          MISC1: "SURVEY_POPUP",
          MISC2: "displayed",
        });
      } else {
        return null;
      }

      return (
        <FixedPopover
          show={should_show}
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
                  onClick={() => this.handleButtonPress("yes")}
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
                    this.handleButtonPress("short_survey_submitted")
                  }
                />
              </div>
            </Fragment>
          }
          footer={
            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
              {_.map(["later", "no"], (button_type) => (
                <button
                  key={button_type}
                  className="btn btn-ib-primary"
                  onClick={() => this.handleButtonPress(button_type)}
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
);
