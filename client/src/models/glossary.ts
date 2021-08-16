import _ from "lodash";

import { sanitized_marked } from "src/general_utils";

import { StaticStoreFactory } from "./storeMixins";
import { trivial_text_maker } from "./text";

type GlossaryEntryDef = {
  id: string;
  title: string;
  raw_definition: string;
  translation: string;
};

type GlossaryEntryInst = GlossaryEntryDef & {
  get_compiled_definition: () => string;
};

const glossaryEntryStore = StaticStoreFactory<
  GlossaryEntryDef,
  GlossaryEntryInst
>((def: GlossaryEntryDef) => ({
  ...def,
  get_compiled_definition: () => compiled_definitions(def.raw_definition),
}));

const compiled_definitions = _.memoize((raw_definition) =>
  sanitized_marked(raw_definition)
);

const glossary_display = (item: GlossaryEntryInst) => `<div aria-live="polite">
  <div class="h6 medium-weight"> ${trivial_text_maker("definition")} : ${
  item.title
} </div>
  <div>${item.get_compiled_definition()}</div>
</div>`;

const get_glossary_item_tooltip_html = (key: string) => {
  const glossary_entry = glossaryEntryStore.lookup(key);

  if (glossary_entry) {
    glossary_display(glossary_entry);
  } else {
    throw new Error(`No glossary entry with key "${key}"`);
  }
};

export { glossaryEntryStore, get_glossary_item_tooltip_html };
