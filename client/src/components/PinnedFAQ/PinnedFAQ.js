import _ from "lodash";
import React from "react";

import { KeyConceptList } from "src/components/KeyConceptList/KeyConceptList";

import { Gov } from "src/models/organizational_entities";

import { secondaryColor } from "src/style_constants/colors.interop.scss";

import { SomeThingsToKeepInMind } from "./faq_utils";

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
      <SomeThingsToKeepInMind
        is_initially_expanded={is_initially_expanded}
        background_color={background_color}
      >
        <KeyConceptList
          question_answer_pairs={_.map(q_a_key_pairs, (pair) => [
            <TM key={"q"} k={pair[0]} args={{ subject }} />,
            <TM key={"a"} k={pair[1]} args={{ subject }} />,
          ])}
        />
      </SomeThingsToKeepInMind>
    );
  }
}
PinnedFAQ.defaultProps = {
  background_color: secondaryColor,
  is_initially_expanded: false,
  subject: Gov,
};
