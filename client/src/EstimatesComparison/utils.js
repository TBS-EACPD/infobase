//import _ from "lodash";

import { create_text_maker_component } from "src/components/index";

import { CURRENT_EST_DOC } from "src/models/estimates";

import text from "./EstimatesComparison.yaml";

export const { text_maker, TM } = create_text_maker_component(text);

export const current_doc_is_mains = CURRENT_EST_DOC === "MAINS";
export const current_sups_letter = "C";
///^SE(A|B|C)$/.test(CURRENT_EST_DOC) && _.last(CURRENT_EST_DOC);
