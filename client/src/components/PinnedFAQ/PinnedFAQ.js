import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { ButtonToolbar } from "react-bootstrap";

import { AccordionAuto } from "src/components/Accordion";

import { KeyConceptList } from "src/components/KeyConceptList/KeyConceptList";

import { PinnedContent } from "src/components/PinnedContent/PinnedContent";

import { Gov } from "src/models/subjects";
import { trivial_text_maker } from "src/models/text";

import { secondaryColor } from "src/style_constants/colors.interop.scss";

export const SOME_THINGS_TO_KEEP_IN_MIND_STORAGE_KEY =
  "user_enabled_pinning_key_concepts";

export class PinnedFAQ extends React.Component {
  render() {
    const {
      q_a_key_pairs,
      TM,
      is_initially_expanded,
      background_color,
      subject,
    } = this.props;

    return (
      <PinnedContent
        local_storage_name={SOME_THINGS_TO_KEEP_IN_MIND_STORAGE_KEY}
      >
        <div className={classNames("mrgn-bttm-md")}>
          <ButtonToolbar style={{ margin: 0 }}>
            <AccordionAuto
              title={trivial_text_maker("infographic_faq")}
              is_initially_expanded={is_initially_expanded}
              background_color={background_color}
            >
              <div
                style={{
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <KeyConceptList
                  question_answer_pairs={_.map(
                    q_a_key_pairs,
                    ([q_key, a_key]) => [
                      <TM key={"q"} k={q_key} args={{ subject }} />,
                      <TM key={"a"} k={a_key} args={{ subject }} />,
                    ]
                  )}
                />
              </div>
            </AccordionAuto>
          </ButtonToolbar>
        </div>
      </PinnedContent>
    );
  }
}
PinnedFAQ.defaultProps = {
  background_color: secondaryColor,
  is_initially_expanded: false,
  no_pin: false,
  subject: Gov.instance,
};
