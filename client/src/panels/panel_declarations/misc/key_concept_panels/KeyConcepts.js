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

    let can_pin;
    if (has_local_storage) {
      try {
        can_pin = JSON.parse(localStorage.getItem(`can_pin_key_concepts`));
      } catch {
        can_pin = null;
      }
    }

    this.keyConceptsContainerRef = React.createRef();

    this.state = {
      can_pin: _.isBoolean(can_pin) ? can_pin : true,
    };
  }

  render() {
    const { rendered_q_a_keys, subject } = this.props;

    const { can_pin: can_pin } = this.state;

    const sticky_data = {
      can_pin: can_pin,
      pin_pressed: () =>
        this.setState((prev_state) => {
          localStorage.setItem("can_pin_key_concepts", !prev_state.can_pin);
          return { can_pin: !prev_state.can_pin };
        }),
    };

    return (
      <ReactResizeDetector handleWidth>
        {({ width }) => (
          <InView>
            {({ inView, ref }) => (
              <div style={{ position: "relative" }} ref={ref}>
                <MediaQuery maxWidth={breakpoints.maxMediumDevice}>
                  {(matches) => (
                    <div
                      className={classNames(
                        "mrgn-bttm-md",
                        matches && "mrgn-tp-md",
                        !inView && can_pin && "sticky"
                      )}
                      style={{
                        width: width,
                      }}
                    >
                      <ButtonToolbar>
                        <AutoAccordion
                          title={text_maker("some_things_to_keep_in_mind")}
                          ref={this.accordionRef}
                          showPin
                          sticky_data={sticky_data}
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
