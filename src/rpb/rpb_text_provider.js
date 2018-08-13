
import rpb_text from './rpb.yaml';
import { 
  create_tm_cmpnt,
  TrivialTextMaker,
} from '../util_components.js';

export const [ text_maker, TM ] = create_tm_cmpnt(rpb_text);
export const TextMaker = TrivialTextMaker;