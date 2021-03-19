import * as util_components from "src/components/index.js";

const { create_text_maker_component } = util_components;

import text1 from "./gnc-text.yaml";

export const { text_maker, TM } = create_text_maker_component([text1]);
