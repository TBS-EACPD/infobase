import { create_text_maker_component } from "src/panels/panel_declarations/shared.js";

import drilldown_text from "./result_drilldown/result_drilldown.yaml";

import component_text from "./result_components.yaml";
import result_table_text from "./result_table_text.yaml";

export const { text_maker, TM } = create_text_maker_component([
  drilldown_text,
  component_text,
  result_table_text,
]);
