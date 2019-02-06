import text from './gnc-text.yaml';
import { 
  create_text_maker_component,
} from '../shared.js';

export const { text_maker, TM } = create_text_maker_component(text);
