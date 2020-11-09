import classNames from "classnames";
import { ButtonToolbar } from "react-bootstrap";
import { InView } from "react-intersection-observer";
import ReactResizeDetector from "react-resize-detector";
import MediaQuery from "react-responsive";
import { withRouter } from "react-router";
import "intersection-observer";

import { has_local_storage } from "src/core/feature_detection.js";

import { util_components, breakpoints } from "../../shared.js";

import "./KeyConcepts.scss";

import common_lang from "./common_questions.yaml";
import fin_lang from "./financial_questions.yaml";
import ppl_lang from "./people_questions.yaml";
import results_lang from "./results_questions.yaml";
import tag_lang from "./tagging_questions.yaml";

const {
  create_text_maker_component,
  AutoAccordion,
  KeyConceptList,
} = util_components;

const { text_maker, TM } = create_text_maker_component([
  common_lang,
  fin_lang,
  ppl_lang,
  results_lang,
  tag_lang,
]);

class KeyConcepts_ extends React.Component {
  constructor(props) {
    super(props);
    this.accordionRef = React.createRef(null);

    let user_enabled_pinning;
    if (has_local_storage) {
      try {
        user_enabled_pinning = JSON.parse(
          localStorage.getItem(`user_enabled_pinning_key_concepts`)
        );
      } catch {
        user_enabled_pinning = true;
      }
    }

    this.keyConceptsContainerRef = React.createRef();

    this.state = {
      user_enabled_pinning: _.isBoolean(user_enabled_pinning)
        ? user_enabled_pinning
        : true,
    };
  }

  componentDidUpdate(prev_props, prev_state) {
    localStorage.setItem(
      "user_enabled_pinning_key_concepts",
      !prev_state.user_enabled_pinning
    );
  }

  pin_pressed = () => {
    const { user_enabled_pinning } = this.state;
    this.setState({
      user_enabled_pinning: !user_enabled_pinning,
    });
  };

  render() {
    const { rendered_q_a_keys, subject } = this.props;

    const { user_enabled_pinning } = this.state;

    return (
      <ReactResizeDetector handleWidth>
        {({ width }) => (
          <InView>
            {({ inView, ref, entry }) => (
              <div style={{ position: "relative" }} ref={ref}>
                <MediaQuery maxWidth={breakpoints.maxMediumDevice}>
                  {(matches) => (
                    <div
                      className={classNames(
                        "mrgn-bttm-md",
                        matches && "mrgn-tp-md",
                        !inView &&
                          user_enabled_pinning &&
                          entry &&
                          entry.boundingClientRect.top < 0 &&
                          "sticky"
                      )}
                      style={{
                        width: width,
                      }}
                    >
                      <ButtonToolbar>
                        <AutoAccordion
                          title={text_maker("some_things_to_keep_in_mind")}
                          ref={this.accordionRef}
                          show_pin
                          can_pin={user_enabled_pinning}
                          pin_pressed={this.pin_pressed}
                        >
                          <div
                            style={{
                              paddingLeft: "10px",
                              paddingRight: "10px",
                            }}
                          >
                            <KeyConceptList
                              question_answer_pairs={_.map(
                                rendered_q_a_keys,
                                (key) => [
                                  <TM
                                    key={key + "_q"}
                                    k={key + "_q"}
                                    args={{ subject }}
                                  />,
                                  <TM
                                    key={key + "_a"}
                                    k={key + "_a"}
                                    args={{ subject }}
                                  />,
                                ]
                              )}
                            />
                          </div>
                        </AutoAccordion>
                      </ButtonToolbar>
                    </div>
                  )}
                </MediaQuery>
              </div>
            )}
          </InView>
        )}
      </ReactResizeDetector>
    );
  }
}

export const KeyConcepts = withRouter(KeyConcepts_);
