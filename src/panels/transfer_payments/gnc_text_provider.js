import text from './gnc-text.yaml';
import { 
  CreateTMComponent,
} from '../shared.js';

export const { text_maker, TM } = CreateTMComponent(text);
