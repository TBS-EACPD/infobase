import _ from "lodash";

import { glossaryEntryStore } from "src/models/glossary";

export interface ResultProps {
  id: string;
  title: string;
  translation: string;
  raw_definition: string;
  get_compiled_definition: () => string;
}

const get_glossary_items_by_letter = (results: ResultProps[] | null) => {
  let glossary_items;
  if (results) {
    glossary_items =
      results.length > 0 ? results : glossaryEntryStore.get_all();
  } else {
    glossary_items = glossaryEntryStore.get_all();
  }

  const glossary_items_by_letter = _.chain(glossary_items)
    .groupBy((item) => {
      const first_letter = item.title[0];
      return _.deburr(first_letter);
    })
    .map((items, letter) => {
      const sorted_items = _.sortBy(items, "title");
      return {
        items: sorted_items,
        letter,
      };
    })
    .sortBy("letter")
    .value();
  return glossary_items_by_letter;
};

export { get_glossary_items_by_letter };
