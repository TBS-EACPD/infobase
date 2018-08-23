import dept_explore_text from './dept_explore.yaml';
import { create_text_maker_component } from '../util_components.js';

export const { text_maker, TM } = create_text_maker_component(dept_explore_text)