import text from './EstimatesComparison.yaml';
import { create_text_maker_component } from '../components/index.js';

export const { text_maker, TM } = create_text_maker_component(text);