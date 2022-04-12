import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";

import { PinnedFAQ } from "src/components/index";
import { create_text_maker_component } from "src/components/misc_util_components";

import common_faq from "src/common_text/faq/common_questions.yaml";
import fin_faq from "src/common_text/faq/financial_questions.yaml";
import ppl_faq from "src/common_text/faq/people_questions.yaml";
import results_faq from "src/common_text/faq/results_questions.yaml";
import tag_faq from "src/common_text/faq/tagging_questions.yaml";

const common_panel_config = {
  is_meta_panel: true,
  footnotes: false,
  source: false,
  get_title: _.constant(false),
  calculate: _.constant(true),
};

const curried_render = ({ q_a_key_pairs }) =>
  function ({ subject }) {
    let rendered_q_a_key_pairs = _.compact([
      ...q_a_key_pairs,
      subject.subject_type === "crso" && ["what_are_CR_q", "what_are_CR_a"],
    ]);

    const { TM } = create_text_maker_component([
      fin_faq,
      ppl_faq,
      results_faq,
      tag_faq,
      common_faq,
    ]);

    return (
      <PinnedFAQ
        q_a_key_pairs={rendered_q_a_key_pairs}
        TM={TM}
        subject={subject}
      />
    );
  };

export const declare_financial_key_concepts_panel = () =>
  declare_panel({
    panel_key: "financial_key_concepts",
    subject_types: ["gov", "dept", "crso", "program"],
    panel_config_func: (subject_type) => ({
      ...common_panel_config,
      render: curried_render({
        q_a_key_pairs: [
          ["what_is_fy_q", "what_is_fy_a"],
          [
            "where_does_authority_come_from_q",
            "where_does_authority_come_from_a",
          ],
          ["what_are_mains_q", "what_are_mains_a"],
          ["what_are_supps_q", "what_are_supps_a"],
          ["what_are_exps_q", "what_are_exps_a"],
          ["why_cant_i_see_prov_spend_q", "why_cant_i_see_prov_spend_a"],
          ["what_spending_is_included_q", "what_spending_is_included_a"],
          subject_type === "dept" && [
            "different_org_names_q",
            "different_org_names_a",
          ],
        ],
      }),
    }),
  });

export const declare_results_key_concepts_panel = () =>
  declare_panel({
    panel_key: "results_key_concepts",
    subject_types: ["gov", "dept", "crso", "program"],
    panel_config_func: (subject_type) => ({
      ...common_panel_config,
      render: curried_render({
        q_a_key_pairs: [
          ["what_is_policy_on_results_q", "what_is_policy_on_results_a"],
          ["what_is_diff_with_mrrs_q", "what_is_diff_with_mrrs_a"],
          ["what_is_a_drf_q", "what_is_a_drf_a"],
          ["how_do_orgs_measure_perf_q", "how_do_orgs_measure_perf_a"],
          ["what_are_DPs_and_DRRs_q", "what_are_DPs_and_DRRs_a"],
          subject_type === "dept" && [
            "different_org_names_q",
            "different_org_names_a",
          ],
        ],
      }),
    }),
  });

export const declare_people_key_concepts_panel = () =>
  declare_panel({
    panel_key: "people_key_concepts",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => ({
      ...common_panel_config,
      render: curried_render({
        q_a_key_pairs: [
          ["who_is_fps_q", "who_is_fps_a"],
          ["what_ppl_are_included_q", "what_ppl_are_included_a"],
          ["what_ppl_arent_included_q", "what_ppl_arent_included_a"],
          ["where_is_data_q", "where_is_data_a"],
          subject_type === "dept" && [
            "different_org_names_q",
            "different_org_names_a",
          ],
        ],
      }),
    }),
  });

export const declare_tagging_key_concepts_panel = () =>
  declare_panel({
    panel_key: "tagging_key_concepts",
    subject_types: ["tag"],
    panel_config_func: () => ({
      ...common_panel_config,
      render: curried_render({
        q_a_key_pairs: [
          ["what_is_tagging_q", "what_is_tagging_a"],
          ["what_is_prog_tagging_q", "what_is_prog_tagging_a"],
          ["what_tags_are_available_q", "what_tags_are_available_a"],
          ["what_are_how_we_help_q", "what_are_how_we_help_a"],
          ["what_are_gocos_q", "what_are_gocos_a"],
        ],
      }),
    }),
  });
