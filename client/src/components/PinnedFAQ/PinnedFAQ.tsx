import React from "react";

import { KeyConceptList } from "src/components/KeyConceptList/KeyConceptList";

import { secondaryColor } from "src/style_constants/colors.interop.scss";

import { SomeThingsToKeepInMind } from "./faq_utils";

type PinnedFAQProps = {
  question_answer_pairs: React.ReactNode[][]; // TODO: change to [React.ReactNode, React.ReactNode][] when faq_utils gets converted to ts
  is_initially_expanded?: boolean;
  background_color?: string;
} & typeof PinnedFAQ.defaultProps;

export class PinnedFAQ extends React.Component<PinnedFAQProps> {
  static defaultProps = {
    background_color: secondaryColor,
    is_initially_expanded: false,
  };
  render() {
    const { question_answer_pairs, is_initially_expanded, background_color } =
      this.props;

    return (
      <SomeThingsToKeepInMind
        is_initially_expanded={is_initially_expanded}
        background_color={background_color}
      >
        <KeyConceptList
          question_answer_pairs={
            // need type assertion here because question_answer_pairs_maker is js and can't return a tuple
            question_answer_pairs as [React.ReactNode, React.ReactNode][]
          }
        />
      </SomeThingsToKeepInMind>
    );
  }
}
