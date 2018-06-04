import { 
  TM as StdTM,
  create_text_maker,
} from '../shared.js';
import text from './sobj-panel-text.yaml';
export const text_maker = create_text_maker(text);
export const TM = props => <StdTM tmf={text_maker} {...props} />;