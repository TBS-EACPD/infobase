import text from './gnc-text.yaml';
import { 
  create_tm_cmpnt,
} from '../shared.js';

export const [ text_maker, TM ] = create_tm_cmpnt(text);
