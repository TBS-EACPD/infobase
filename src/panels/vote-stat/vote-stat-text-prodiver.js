import { 
  create_text_maker,
  TM as StdTM,
} from '../shared.js';
import text from './vote-stat-text.yaml';

export const text_maker = create_text_maker(text)
export const TM = props => <StdTM tmf={text_maker} {...props} />;
