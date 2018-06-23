import intro_lang from './intro_lang.yaml';
import fin_lang from "./financial_intro.yaml";
import ppl_lang from "./people_intro.yaml";
import results_lang from "./results_intro.yaml";
import tag_lang from "./tagging_intro.yaml";
import { 
  create_text_maker,
  util_components,
} from '../shared.js';

const { text_maker: StdTextMaker, TM: StdTM} = util_components;

export const text_maker = create_text_maker([intro_lang, fin_lang, ppl_lang, results_lang, tag_lang]);
export const TextMaker = props => <StdTextMaker tmf={text_maker} {...props} />
export const TM = props => <StdTM tmf={text_maker} {...props} />