
import rpb_text from './rpb.yaml';
import { 
  CTMTM,
  TrivialTextMaker,
} from '../util_components.js';

export const [ text_maker, TM ] = CTMTM(rpb_text);
export const TextMaker = TrivialTextMaker;