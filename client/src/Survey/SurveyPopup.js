import { Fragment } from "react";
import { withRouter } from "react-router";

import { tertiaryColor } from "src/core/color_defs.js";

import {
  FixedPopover,
  create_text_maker_component,
  EmailFrontend,
} from "../components/index.js";
import { log_standard_event } from "../core/analytics.js";
import { IconFeedback } from "../icons/icons.js";

import text from "./SurveyPopup.yaml";

const { TM, text_maker } = create_text_maker_component(text);

const page_visit_increment = 1;
const survey_campaign_end_date = new Date(2021, 0, 1).getTime(); // Reminder: months are 0-indexed, years and days aren't

const get_path_root = (path) =>
  _.chain(path).replace(/^\//, "").split("/").first().value();

const miliseconds_in_five_minutes = 60 * 5 * 1000;
const miliseconds_in_a_half_year = 60 * 60 * 24 * (365 / 2) * 1000;
const should_reset_local_storage = () => {
  const is_deactivated = localStorage.getItem(
    `infobase_survey_popup_deactivated`
  );

  const postponed_since = localStorage.getItem(
    `infobase_survey_popup_postponed_since`
  );
  const stale_postponement =
    postponed_since &&
    Date.now() - postponed_since > miliseconds_in_five_minutes;

  const deactivated_since = localStorage.getItem(
    `infobase_survey_popup_deactivated_since`
  );
  const stale_deactivation =
    deactivated_since &&
    Date.now() - deactivated_since > miliseconds_in_a_half_year;

  return is_deactivated && (stale_postponement || stale_deactivation);
};

const reset_local_storage = () => {
  localStorage.removeItem("infobase_survey_popup_page_visited");
  localStorage.removeItem("infobase_survey_popup_deactivated");
  localStorage.removeItem("infobase_survey_popup_deactivated_since");
};

const get_state_defaults = () => {
  const default_active = true;
  const default_page_visited = 1;

  const local_storage_deactivated = localStorage.getItem(
    `infobase_survey_popup_deactivated`
  );
  const local_storage_page_visited = localStorage.getItem(
    `infobase_survey_popup_page_visited`
  );

  // localStorage is all strings, note that we cast the values read from it to a boolean and a number below
  return {
    active: !_.isNull(local_storage_deactivated)
      ? !local_storage_deactivated
      : default_active,
    page_visited: !_.isNull(local_storage_page_visited)
      ? +local_storage_page_visited
      : default_page_visited,
  };
};

const is_survey_campaign_over = () =>
  Date.now() > survey_campaign_end_date || window.is_dev || window.is_dev_link;

export const SurveyPopup = withRouter(
  class _SurveyPopup extends React.Component {
    constructor(props) {
      super(props);

      props.history.listen(({ pathname }) => {
        if (
          this.state.active &&
          this.state.previous_path_root !== get_path_root(pathname)
        ) {
          const new_page_visited =
            this.state.page_visited + page_visit_increment;

          localStorage.setItem(
            `infobase_survey_popup_page_visited`,
            new_page_visited
          );

          this.setState({
            page_visited: new_page_visited,
            previous_path_root: get_path_root(pathname),
          });
        }
      });

      if (should_reset_local_storage()) {
        reset_local_storage();
      }

      const { active, page_visited } = get_state_defaults();

      this.timeout = setTimeout(() => {
        this.setState({ show_popup: true });
      }, 180000);

      this.state = {
        active: active,
        page_visited: page_visited,
        previous_path_root: null,
        show_popup: false,
      };
    }
    handleButtonPress = (button_type) => {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", "") || "start",
        MISC1: "SURVEY_POPUP",
        MISC2: `interaction: ${button_type}`,
      });

      localStorage.setItem(`infobase_survey_popup_deactivated`, "true");
      if (_.includes(["yes", "no", "short_survey_submitted"], button_type)) {
        localStorage.setItem(
          `infobase_survey_popup_deactivated_since`,
          Date.now()
        );
      } else if (button_type === "later") {
        localStorage.setItem(
          `infobase_survey_popup_postponed_since`,
          Date.now()
        );
      }

      this.setState({ active: false, show_popup: false });
    };
    static getDerivedStateFromProps(props) {
      if (props.showSurvey) {
        return { active: false };
      }

      return null;
    }
    shouldComponentUpdate(nextProps, nextState) {
      const page_changed = this.state.page_visited !== nextState.page_visited;
      const is_closing = this.state.active !== nextState.active;
      const state_show_popup = this.state.show_popup !== nextState.show_popup;

      return page_changed || is_closing || state_show_popup;
    }
    render() {
      const { active, page_visited, show_popup } = this.state;

      const should_show =
        !is_survey_campaign_over() &&
        (page_visited >= 3 || show_popup) &&
        active;

      if (should_show) {
        clearTimeout(this.timeout);
        this.timeout = null;
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", "") || "start",
          MISC1: "SURVEY_POPUP",
          MISC2: "displayed",
        });
      }

      return (
        <FixedPopover
          show={should_show}
          title={
            <Fragment>
              <IconFeedback
                title={text_maker("suvey_popup_header")}
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
                <EmailFrontend
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
