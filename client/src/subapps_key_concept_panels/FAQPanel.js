import _ from "lodash";
import React from "react";

import { SomeThingsToKeepInMind } from "src/panels/panel_declarations/common_panel_components";

import {
  create_text_maker_component,
  KeyConceptList,
} from "src/components/index";

import { Gov as subject } from "src/models/organizational_entities";

import est_lang from "src/EstimatesComparison/estimates_comparison_questions.yaml";

const { TM } = create_text_maker_component([est_lang]);

export class FAQPanel extends React.Component {
  constructor(props) {
    super();
  }

  render() {
    const { q_a_keys } = this.props;

    const testing = _.map(q_a_keys, (base_text_key) => [
      <TM key={"q"} k={base_text_key + "_q"} args={subject} />,
      <TM key={"a"} k={base_text_key + "_a"} args={subject} />,
    ]);
    console.log("testing");
    console.log(testing);

    return (
      <SomeThingsToKeepInMind>
        <KeyConceptList
          question_answer_pairs={_.map(q_a_keys, (base_text_key) => [
            <TM key={"q"} k={base_text_key + "_q"} args={subject} />,
            <TM key={"a"} k={base_text_key + "_a"} args={subject} />,
          ])}
        />
      </SomeThingsToKeepInMind>
    );
  }
}
