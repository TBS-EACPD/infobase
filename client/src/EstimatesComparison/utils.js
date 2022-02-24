import _ from "lodash";

import { create_text_maker_component } from "src/components/index";

import { Table } from "src/tables/TableClass";

import text from "./EstimatesComparison.yaml";

export const { text_maker, TM } = create_text_maker_component(text);

const current_doc_code = Table.store
  .lookup("orgVoteStatEstimates")
  .get_current_doc_code();

export const current_doc_is_mains = current_doc_code === "MAINS";
export const current_sups_letter =
  /^SE(A|B|C)$/.test(current_doc_code) && _.last(current_doc_code);
