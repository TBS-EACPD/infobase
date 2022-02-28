import { create_text_maker_component } from "src/components/index";

import { CURRENT_EST_DOC, get_est_doc_name } from "src/models/estimates";

import { lang } from "src/core/injected_build_constants";

import text from "./vote_stat_text.yaml";

export const { text_maker, TM } = create_text_maker_component([
  text,
  {
    last_estimates: {
      [lang]: get_est_doc_name(CURRENT_EST_DOC),
    },
  },
]);
