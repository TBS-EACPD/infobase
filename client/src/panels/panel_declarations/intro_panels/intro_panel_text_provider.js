import intro_lang from "./intro_lang.yaml";
import simplographic from "./simplographic.yaml";
import gov_related from "./gov_related.yaml";

import { util_components } from '../shared.js';
const { create_text_maker_component } = util_components;

export const { text_maker, TM } = create_text_maker_component([intro_lang, simplographic, gov_related]);
