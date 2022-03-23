import _ from "lodash";

import { make_store } from "src/models/utils/make_store";

import { sanitized_marked } from "src/general_utils";

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

export { glossaryEntryStore };
