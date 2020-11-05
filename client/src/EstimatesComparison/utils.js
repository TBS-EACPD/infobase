import { create_text_maker_component } from "../components/index.js";

import text from "./EstimatesComparison.yaml";

export const { text_maker, TM } = create_text_maker_component(text);

export const current_doc_is_mains = false; // Update this when switching between displaying mains and sups!
export const current_sups_letter = "B"; // Update this on each new sups release!
