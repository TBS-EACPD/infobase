import React from "react";

import { SomeThingsToKeepInMind } from "src/panels/panel_declarations/common_panel_components";

import { KeyConceptList } from "src/components/KeyConceptList/KeyConceptList";

import { secondaryColor } from "src/style_constants/colors.interop.scss";

export class StandardFAQ extends React.Component {
  render() {
    const { faq_content, is_initially_expanded, background_color } = this.props;

    return (
      <SomeThingsToKeepInMind
        is_initially_expanded={is_initially_expanded}
        background_color={background_color}
      >
        <KeyConceptList question_answer_pairs={faq_content} />
      </SomeThingsToKeepInMind>
    );
  }
}
StandardFAQ.defaultProps = {
  background_color: secondaryColor,
  is_initially_expanded: false,
};
