
import rpb_text from './rpb.yaml';
import { 
  create_tm_cmpnt,
  TextMaker as StandardTextMaker
} from '../util_components.js';

export const [ text_maker, TM ] = create_tm_cmpnt(rpb_text);
export const TextMaker = props => <StandardTextMaker text_maker_func={text_maker} {...props} />;
