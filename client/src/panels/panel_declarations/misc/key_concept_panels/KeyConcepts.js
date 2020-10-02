import classNames from "classnames";
import { Fragment } from "react";
import MediaQuery from "react-responsive";
import { withRouter } from "react-router";
import { ButtonToolbar, Overlay, Popover } from "react-bootstrap";

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

const text = {
  click_text: {
    en: "Recommended reading",
    fr: "Lecture recommandée",
  },
};

const { text_maker, TM } = create_text_maker_component([
  common_lang,
  fin_lang,
  ppl_lang,
  results_lang,
  tag_lang,
  text,
]);

class KeyConcepts_ extends React.Component {
  state = {
    is_showing_tooltip: false,
  };
  constructor(props) {
    super(props);
    this.accordionRef = React.createRef(null);

    const {
      match: {
        params: { active_bubble_id },
      },
    } = this.props;

    if (has_local_storage) {
      const do_not_display = localStorage.getItem(
        `hide_${active_bubble_id}_key_concepts_popup`
      );

      if (_.isNull(do_not_display)) {
        this.timeout = setTimeout(
          () => this.setState({ is_showing_tooltip: true }),
          1000
        );
      }
    }
  }

  render() {
    const {
      rendered_q_a_keys,
      subject,
      match: {
        params: { active_bubble_id },
      },
    } = this.props;

    const { is_showing_tooltip } = this.state;

    const disable_popup = () => {
      this.timeout && clearTimeout(this.timeout);
      this.setState({ is_showing_tooltip: false });
      has_local_storage &&
        localStorage.setItem(
          `hide_${active_bubble_id}_key_concepts_popup`,
          true
        );
    };

    return (
      <Fragment>
        <MediaQuery maxWidth={breakpoints.maxMediumDevice}>
          {(matches) => (
            <div
              className={classNames("mrgn-bttm-md", matches && "mrgn-tp-md")}
              onClick={disable_popup}
              style={{ position: "relative" }}
            >
              <ButtonToolbar>
                <AutoAccordion
                  title={text_maker("some_things_to_keep_in_mind")}
                  ref={this.accordionRef}
                >
                  <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                    <KeyConceptList
                      question_answer_pairs={_.map(rendered_q_a_keys, (key) => [
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
                      ])}
                    />
                  </div>
                </AutoAccordion>

                <Overlay
                  show={is_showing_tooltip}
                  target={this.accordionRef.current}
                  container={this}
                  placement="top"
                >
                  <Popover id="keep_in_mind_tooltip" style={{}}>
                    {text_maker("click_text")}
                  </Popover>
                </Overlay>
              </ButtonToolbar>
            </div>
          )}
        </MediaQuery>
      </Fragment>
    );
  }
}

export const KeyConcepts = withRouter(KeyConcepts_);
