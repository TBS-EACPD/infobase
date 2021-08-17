import React from "react";

import { SomeThingsToKeepInMind } from "src/panels/panel_declarations/common_panel_components";

import { KeyConceptList } from "src/components/KeyConceptList/KeyConceptList";

import { secondaryColor } from "src/style_constants/colors.interop.scss";

type StandardFAQProps = {
  faq_content: React.ReactNode[][]; // TODO: change to [React.ReactNode, React.ReactNode][] when faq_utils gets converted to ts
  is_initially_expanded?: boolean;
  background_color?: string;
} & typeof StandardFAQ.defaultProps;

export class StandardFAQ extends React.Component<StandardFAQProps> {
  static defaultProps = {
    background_color: secondaryColor,
    is_initially_expanded: false,
  };
  render() {
    const { faq_content, is_initially_expanded, background_color } = this.props;

    return (
      <SomeThingsToKeepInMind
        is_initially_expanded={is_initially_expanded}
        background_color={background_color}
      >
        <KeyConceptList
          question_answer_pairs={
            // need type assertion here because faq_content_maker is js and can't return a tuple
            faq_content as [React.ReactNode, React.ReactNode][]
          }
        />
      </SomeThingsToKeepInMind>
    );
  }
}
