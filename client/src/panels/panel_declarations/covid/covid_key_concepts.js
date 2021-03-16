import _ from "lodash";
import React from "react";

import common_questions from "src/panels/panel_declarations/misc/key_concept_panels/common_questions.yaml";
import {
  util_components,
  SomeThingsToKeepInMind,
  declare_panel,
} from "src/panels/panel_declarations/shared.js";

import { covid_create_text_maker_component } from "./covid_text_provider.js";

import covid_questions from "./covid_key_concepts.yaml";

const { KeyConceptList } = util_components;

const { TM } = covid_create_text_maker_component([
  covid_questions,
  common_questions,
]);

const panel_key = "covid_key_concepts";

export const declare_covid_key_concepts_panel = () =>
  declare_panel({
    panel_key,
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      is_static: true,
      footnotes: false,
      source: false,
      calculate: _.constant(true),
      render: () => (
        <SomeThingsToKeepInMind>
          <KeyConceptList
            question_answer_pairs={_.chain([
              "up_to_date",
              "spent",
              "other_expenditure_reporting",
              "implementation_status",
              "auth_but_no_exp",
              "missing_measures",
              "initiatives",
              "accruals",
            ])
              .compact()
              .map((key) => [
                <TM key={"q"} k={`covid_questions_${key}_q`} />,
                <TM key={"a"} k={`covid_questions_${key}_a`} />,
              ])
              .concat([
                [
                  <TM key={"q"} k={"different_org_names_q"} />,
                  <TM key={"a"} k={"different_org_names_a"} />,
                ],
              ])
              .value()}
          />
        </SomeThingsToKeepInMind>
      ),
    }),
  });

export const scroll_to_covid_key_concepts = () => {
  // Doing this imperatively, better behaviour for users than alternative (such as using a panel_key url option and the router).
  // More brittle this way, but the assumption that panels have their panel key as an id, and that the key concept panel will
  // be rendered (given it's calculate of _.constant(true)) are fundamental infographic assumptions, so safe enough
  const covid_key_concept_panel = document.querySelector(`#${panel_key}`);

  if (!_.isNull(covid_key_concept_panel)) {
    window.scrollTo(0, covid_key_concept_panel.offsetTop);
    covid_key_concept_panel.focus();

    // Ok, this is where it gets more brittle/hacky. Leaking up a bunch of knowledge about SomeThingsToKeepInMind/AutoAccordion
    // implementation. Should fail softly if those change, and as long as they don't it's a solid UX improvement
    const accordion_header_button = covid_key_concept_panel.querySelector(
      ".pull-down-accordion-header > button"
    );
    const accordion_body = covid_key_concept_panel.querySelector(
      ".pull-down-accordion-body"
    );

    const accordion_exists_and_is_not_expanded =
      !_.isNull(accordion_header_button) && _.isNull(accordion_body);

    accordion_exists_and_is_not_expanded && accordion_header_button.click();
  }
};
