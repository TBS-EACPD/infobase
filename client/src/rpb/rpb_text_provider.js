
import rpb_text from './rpb.yaml';
import { 
  create_text_maker_component,
  TextMaker as StandardTextMaker,
} from '../components/index.js';

export const { text_maker, TM } = create_text_maker_component(rpb_text);
export const TextMaker = props => <StandardTextMaker text_maker_func={text_maker} {...props} />;
