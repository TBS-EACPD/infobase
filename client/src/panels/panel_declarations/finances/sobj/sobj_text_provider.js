import { create_text_maker_component } from "src/components/index";

import text from "./sobj-panel-text.yaml";

export const { text_maker, TM } = create_text_maker_component(text);
