
import rpb_text from './rpb.yaml';
import { 
  CreateTmCmpnt,
  TextMaker as StandardTextMaker,
} from '../util_components.js';

export const [ text_maker, TM ] = CreateTmCmpnt(rpb_text);
export const TextMaker = props => <StandardTextMaker text_maker_func={text_maker} {...props} />;
