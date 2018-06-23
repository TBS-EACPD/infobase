
import rpb_text from './rpb.yaml';
import { create_text_maker } from '../models/text.js';
import { 
  TM as StandardTM, 
  TextMaker as StandardTextMaker,
} from '../util_components.js';

export const text_maker = create_text_maker(rpb_text);
export const TM = props => <StandardTM tmf={text_maker} {...props} />;
export const TextMaker = props => <StandardTextMaker text_maker_func={text_maker} {...props} />;