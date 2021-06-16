import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import {
  curried_render,
  common_panel_config,
} from "src/panels/panel_declarations/misc/key_concept_panels/key_concept_panels";

import { primaryColor } from "src/core/color_defs";

export const declare_estimates_comparison_key_concepts_panel = () =>
  declare_panel({
    panel_key: "estimates_comparison_key_concepts",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      ...common_panel_config,
      render: curried_render({
        q_a_keys: [
          "how_do_estimates_work",
          "diff_between_stat_vote",
          "how_to_use",
          "question_4",
        ],
        is_initially_expanded: true,
        background_color: primaryColor,
      }),
    }),
  });
