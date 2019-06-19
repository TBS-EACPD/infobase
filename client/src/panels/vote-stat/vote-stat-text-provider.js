import { 
  create_text_maker_component,
} from '../shared.js';
import text1 from './vote-stat-text.yaml';
import text2 from '../../common_text/common_lang.yaml'

export const { text_maker, TM } = create_text_maker_component([text1, text2]);
