import _ from "lodash";
import React from "react";

import { SomeThingsToKeepInMind } from "src/panels/panel_declarations/common_panel_components";

import { KeyConceptList } from "src/components/KeyConceptList/KeyConceptList";

import { Gov } from "src/models/organizational_entities";

import { secondaryColor } from "src/style_constants/colors.interop.scss";

export class StandardFAQ extends React.Component {
  render() {
    const {
      q_a_base_keys,
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
          question_answer_pairs={_.map(q_a_base_keys, (base_text_key) => [
            <TM key={"q"} k={base_text_key + "_q"} args={{ subject }} />,
            <TM key={"a"} k={base_text_key + "_a"} args={{ subject }} />,
          ])}
        />
      </SomeThingsToKeepInMind>
    );
  }
}
StandardFAQ.defaultProps = {
  background_color: secondaryColor,
  is_initially_expanded: false,
  subject: Gov,
};
