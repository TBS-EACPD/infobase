import _ from "lodash";
import React from "react";

import { SomeThingsToKeepInMind } from "src/panels/panel_declarations/common_panel_components";

import common_lang from "src/panels/panel_declarations/misc/key_concept_panels/common_questions.yaml";

import fin_lang from "src/panels/panel_declarations/misc/key_concept_panels/financial_questions.yaml";
import ppl_lang from "src/panels/panel_declarations/misc/key_concept_panels/people_questions.yaml";
import results_lang from "src/panels/panel_declarations/misc/key_concept_panels/results_questions.yaml";
import tag_lang from "src/panels/panel_declarations/misc/key_concept_panels/tagging_questions.yaml";

import sample_lang from "src/components/FAQPanel/FAQPanel.yaml";
import {
  create_text_maker_component,
  KeyConceptList,
} from "src/components/index";

import { Gov } from "src/models/organizational_entities";

import common_subapp_lang from "src/common_text/common_questions.yaml";

import est_lang from "src/EstimatesComparison/estimates_comparison_questions.yaml";
import igoc_lang from "src/IgocExplorer/igoc_explorer_questions.yaml";
import tag_exp_lang from "src/TagExplorer/tag_explorer_questions.yaml";
import text_diff_lang from "src/TextDiff/text_diff_questions.yaml";
import treemap_lang from "src/TreeMap/treemap_questions.yaml";

const { TM } = create_text_maker_component([
  common_lang,
  fin_lang,
  ppl_lang,
  results_lang,
  tag_lang,
  est_lang,
  igoc_lang,
  tag_exp_lang,
  text_diff_lang,
  treemap_lang,
  common_subapp_lang,
  sample_lang,
]);

export class FAQPanel extends React.Component {
  render() {
    const {
      rendered_q_a_keys,
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
          question_answer_pairs={_.map(rendered_q_a_keys, (base_text_key) => [
            <TM key={"q"} k={base_text_key + "_q"} args={{ subject }} />,
            <TM key={"a"} k={base_text_key + "_a"} args={{ subject }} />,
          ])}
        />
      </SomeThingsToKeepInMind>
    );
  }
}
FAQPanel.defaultProps = {
  subject: Gov,
};
