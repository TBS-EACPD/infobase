import _ from "lodash";
import React from "react";

import {
  util_components,
  SomeThingsToKeepInMind,
  declare_panel,
} from "src/panels/panel_declarations/shared.js";

import common_lang from "./common_questions.yaml";
import fin_lang from "./financial_questions.yaml";
import ppl_lang from "./people_questions.yaml";
import results_lang from "./results_questions.yaml";
import tag_lang from "./tagging_questions.yaml";

const { create_text_maker_component, KeyConceptList } = util_components;

const { TM } = create_text_maker_component([
  common_lang,
  fin_lang,
  ppl_lang,
  results_lang,
  tag_lang,
]);

const common_panel_config = {
  is_static: true,
  footnotes: false,
  source: false,
  calculate: _.constant(true),
};

const curried_render = ({ q_a_keys }) =>
  function ({ calculations: { subject } }) {
    let rendered_q_a_keys = _.compact([
      ...q_a_keys,
      subject.level === "crso" && "what_are_CR",
    ]);

    return (
      <SomeThingsToKeepInMind>
        <KeyConceptList
          question_answer_pairs={_.map(rendered_q_a_keys, (base_text_key) => [
            <TM key={"q"} k={base_text_key + "_q"} args={{ subject }} />,
            <TM key={"a"} k={base_text_key + "_a"} args={{ subject }} />,
          ])}
        />
      </SomeThingsToKeepInMind>
    );
  };

export const declare_financial_key_concepts_panel = () =>
  declare_panel({
    panel_key: "financial_key_concepts",
    levels: ["gov", "dept", "crso", "program"],
    panel_config_func: (level, panel_key) => ({
      ...common_panel_config,
      render: curried_render({
        q_a_keys: [
          "what_is_fy",
          "where_does_authority_come_from",
          "what_are_mains",
          "what_are_supps",
          "what_are_exps",
          "why_cant_i_see_prov_spend",
          "what_spending_is_included",
          level === "dept" && "different_org_names",
        ],
      }),
    }),
  });

export const declare_results_key_concepts_panel = () =>
  declare_panel({
    panel_key: "results_key_concepts",
    levels: ["gov", "dept", "crso", "program"],
    panel_config_func: (level, panel_key) => ({
      ...common_panel_config,
      render: curried_render({
        q_a_keys: [
          "what_is_policy_on_results",
          "what_is_diff_with_mrrs",
          "what_is_a_drf",
          "how_do_orgs_measure_perf",
          "what_are_DPs_and_DRRs",
          level === "dept" && "different_org_names",
        ],
      }),
    }),
  });

export const declare_people_key_concepts_panel = () =>
  declare_panel({
    panel_key: "people_key_concepts",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      ...common_panel_config,
      render: curried_render({
        q_a_keys: [
          "who_is_fps",
          "what_ppl_are_included",
          "what_ppl_arent_included",
          "where_is_data",
          level === "dept" && "different_org_names",
        ],
      }),
    }),
  });

export const declare_tagging_key_concepts_panel = () =>
  declare_panel({
    panel_key: "tagging_key_concepts",
    levels: ["tag"],
    panel_config_func: (level, panel_key) => ({
      ...common_panel_config,
      render: curried_render({
        q_a_keys: [
          "what_is_tagging",
          "what_is_prog_tagging",
          "what_tags_are_available",
          "what_are_how_we_help",
          "what_are_gocos",
        ],
      }),
    }),
  });
