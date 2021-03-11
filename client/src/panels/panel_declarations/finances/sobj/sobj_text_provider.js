import { create_text_maker_component } from "src/panels/panel_declarations/shared.js";

import text from "./sobj-panel-text.yaml";

export const { text_maker, TM } = create_text_maker_component(text);
