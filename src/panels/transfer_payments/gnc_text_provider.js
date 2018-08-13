import text from './gnc-text.yaml';
import { 
  CreateTmCmpnt,
} from '../shared.js';

export const [ text_maker, TM ] = CreateTmCmpnt(text);
