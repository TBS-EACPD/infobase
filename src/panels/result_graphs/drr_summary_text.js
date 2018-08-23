import text from "./drr_summary_text.yaml";
import { create_text_maker_component } from '../shared.js';

export const { text_maker, TM } = create_text_maker_component(text);