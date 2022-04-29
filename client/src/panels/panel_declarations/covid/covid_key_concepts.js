import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/PanelRegistry";

import { PinnedFAQ } from "src/components/PinnedFAQ/PinnedFAQ";

import { scroll_into_view_and_focus } from "src/core/NavComponents";

import common_questions from "src/common_text/faq/common_questions.yaml";

import { covid_create_text_maker_component } from "./covid_text_provider";

import covid_questions from "./covid_key_concepts.yaml";

const { TM } = covid_create_text_maker_component([
  covid_questions,
  common_questions,
]);

const panel_key = "covid_key_concepts";

export const declare_covid_key_concepts_panel = () =>
  declare_panel({
    panel_key,
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      is_meta_panel: true,
      get_title: _.constant(false),
      calculate: _.constant(true),
      render: () => (
        <PinnedFAQ
          q_a_key_pairs={[
            ["covid_questions_up_to_date_q", "covid_questions_up_to_date_a"],
            ["covid_questions_spent_q", "covid_questions_spent_a"],
            [
              "covid_questions_other_expenditure_reporting_q",
              "covid_questions_other_expenditure_reporting_a",
            ],
            [
              "covid_questions_implementation_status_q",
              "covid_questions_implementation_status_a",
            ],
            [
              "covid_questions_auth_but_no_exp_q",
              "covid_questions_auth_but_no_exp_a",
            ],
            [
              "covid_questions_missing_measures_q",
              "covid_questions_missing_measures_a",
            ],
            ["different_org_names_q", "different_org_names_a"],
          ]}
          TM={TM}
        />
      ),
    }),
  });

export const scroll_to_covid_key_concepts = () => {
  // Doing this imperatively, better behaviour for users than alternative (such as using a panel_key url option and the router).
  // More brittle this way, but the assumption that panels have their panel key as an id, and that the key concept panel will
  // be rendered (given it's calculate of _.constant(true)) are fundamental infographic assumptions, so safe enough
  const covid_key_concept_panel = document.querySelector(`#${panel_key}`);

  if (!_.isNull(covid_key_concept_panel)) {
    scroll_into_view_and_focus(covid_key_concept_panel);

    // Ok, this is where it gets more brittle/hacky. Leaking up a bunch of knowledge about SomeThingsToKeepInMind/AccordionAuto
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
