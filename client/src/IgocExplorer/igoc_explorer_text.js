import igoc_explorer_bundle from './IgocExplorer.yaml';
import { create_text_maker_component } from '../components/index.js';

export const { text_maker: igoc_tmf, TM } = create_text_maker_component(igoc_explorer_bundle);

