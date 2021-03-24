import { create_text_maker_component } from "src/components/index.js";

import text1 from "./gnc-text.yaml";

export const { text_maker, TM } = create_text_maker_component([text1]);
