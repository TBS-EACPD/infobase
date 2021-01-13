import classNames from "classnames";
import _ from "lodash";
import React from "react";
import { ButtonToolbar } from "react-bootstrap";
import MediaQuery from "react-responsive";
import { withRouter } from "react-router";
import "intersection-observer";

import { PinnedContent } from "../../../../hoc/PinnedContent";
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

    this.keyConceptsContainerRef = React.createRef();
  }

  render() {
    const { rendered_q_a_keys, subject } = this.props;

    return (
      <MediaQuery maxWidth={breakpoints.maxMediumDevice}>
        {(matches) => (
          <PinnedContent local_storage_name="user_enabled_pinning_key_concepts">
            <div
              className={classNames("mrgn-bttm-md", matches && "mrgn-tp-md")}
            >
              <ButtonToolbar style={{ margin: 0 }}>
                <AutoAccordion
                  title={text_maker("some_things_to_keep_in_mind")}
                  ref={this.accordionRef}
                  show_pin
                >
                  <div
                    style={{
                      paddingLeft: "10px",
                      paddingRight: "10px",
                    }}
                  >
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
              </ButtonToolbar>
            </div>
          </PinnedContent>
        )}
      </MediaQuery>
    );
  }
}

export const KeyConcepts = withRouter(KeyConcepts_);
