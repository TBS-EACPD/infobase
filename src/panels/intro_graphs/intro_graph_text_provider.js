import intro_lang from './intro_lang.yaml';
import fin_lang from "./financial_intro.yaml";
import ppl_lang from "./people_intro.yaml";
import results_lang from "./results_intro.yaml";
import tag_lang from "./tagging_intro.yaml";
import { 
  util_components,
} from '../shared.js';

const { create_tm_cmpnt, TrivialTextMaker} = util_components;

export const [ text_maker, TM ] = create_tm_cmpnt([intro_lang, fin_lang, ppl_lang, results_lang, tag_lang]);
export const TextMaker = TrivialTextMaker;