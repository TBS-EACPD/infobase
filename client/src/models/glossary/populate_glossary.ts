import _ from "lodash";

import type { ParsedCsvWithUndefineds } from "src/models/utils/populate_utils";
import { enforced_required_fields } from "src/models/utils/populate_utils";

import { lang } from "src/core/injected_build_constants";

import { glossaryEntryStore } from "./glossary";

export const populate_glossary = (glossary: ParsedCsvWithUndefineds) =>
  _.each(glossary, ({ id, name_en, name_fr, def_en, def_fr }) => {
    const raw_definition = lang === "en" ? def_en : def_fr;

    raw_definition &&
      glossaryEntryStore.create_and_register({
        ...enforced_required_fields({
          id,
          title: lang === "en" ? name_en : name_fr,
          translation: lang === "en" ? name_fr : name_en,
          raw_definition,
        }),
      });
  });
