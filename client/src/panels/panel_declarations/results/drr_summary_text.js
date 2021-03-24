import { create_text_maker_component } from "src/components/index.js";

import text from "./drr_summary_text.yaml";

export const { text_maker, TM } = create_text_maker_component(text);
