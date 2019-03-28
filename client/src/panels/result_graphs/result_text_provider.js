import drilldown_text from "./result_drilldown.yaml";
import component_text from "./result_components.yaml";
import {
  create_text_maker_component,
} from '../shared.js';

export const { text_maker, TM } = create_text_maker_component([drilldown_text, component_text]);
