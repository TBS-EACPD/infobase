import text from './EstimatesComparison.yaml';
import { TM as StdTM } from '../util_components.js';
import { create_text_maker } from '../models/text.js';
export const text_maker = create_text_maker(text);
export const TM = props => <StdTM tmf={text_maker} {...props} />;