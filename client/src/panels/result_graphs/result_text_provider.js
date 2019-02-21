import text from "./result_drilldown.yaml";
import {
  create_text_maker_component,
} from '../shared.js';

export const { text_maker, TM } = create_text_maker_component(text);
