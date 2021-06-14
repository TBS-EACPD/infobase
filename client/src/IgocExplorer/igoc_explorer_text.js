import { create_text_maker_component } from "src/components/index";

import igoc_explorer_bundle from "./IgocExplorer.yaml";

export const { text_maker: igoc_tmf, TM } =
  create_text_maker_component(igoc_explorer_bundle);
