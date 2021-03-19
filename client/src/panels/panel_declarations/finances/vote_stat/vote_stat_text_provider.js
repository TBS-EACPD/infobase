import * as util_components from "src/components/index.js";

const { create_text_maker_component } = util_components;

import text from "./vote_stat_text.yaml";

export const { text_maker, TM } = create_text_maker_component([text]);
