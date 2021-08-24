import _ from "lodash";

import { sanitized_marked } from "src/general_utils";

import { trivial_text_maker } from "./text";
import { make_store } from "./utils/make_store";

type GlossaryEntryDef = {
  id: string;
  title: string;
  raw_definition: string;
  translation: string;
};

const glossaryEntryStore = make_store((def: GlossaryEntryDef) => ({
  ...def,
  get_compiled_definition: () => compiled_definitions(def.raw_definition),
}));

const compiled_definitions = _.memoize((raw_definition) =>
  sanitized_marked(raw_definition)
);

const get_glossary_item_tooltip_html = (key: string) => {
  const glossary_entry = glossaryEntryStore.lookup(key);

  if (typeof glossary_entry !== "undefined") {
    return `<div aria-live="polite">
    <div class="h6 medium-weight"> ${trivial_text_maker("definition")} : ${
      glossary_entry.title
    } </div>
    <div>${glossary_entry.get_compiled_definition()}</div>
  </div>`;
  } else {
    throw new Error(`No glossary entry with key "${key}"`);
  }
};

export { glossaryEntryStore, get_glossary_item_tooltip_html };
