import igoc_explorer_bundle from './igoc_explorer.yaml';
import { create_text_maker } from '../models/text.js';
import { TM as StandardTM } from '../util_components.js';

export const igoc_tmf = create_text_maker(igoc_explorer_bundle);
export const TM = props => <StandardTM tmf={igoc_tmf} {...props} />;

