import text from './EstimatesComparison.yaml';
import { create_text_maker } from '../models/text.js';
import { TM as StdTM } from '../util_components.js';

export const text_maker = create_text_maker(text);
export const TM = props => <StdTM tmf={text_maker} {...props} />;