import { create_text_maker_component } from "src/components/index";

import { lang } from "src/core/injected_build_constants";

import { Table } from "src/tables/TableClass";

import text from "./vote_stat_text.yaml";

export const { text_maker, TM } = create_text_maker_component([
  text,
  {
    last_estimates: {
      [lang]: Table.store.lookup("orgVoteStatEstimates").get_current_doc_name(),
    },
  },
]);
