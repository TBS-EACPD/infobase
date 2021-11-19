import _ from "lodash";
import React from "react";

import { escapeRegExp } from "src/general_utils";

const clean_phrase = (search_phrase: string) =>
  escapeRegExp(_.deburr(search_phrase));

const get_length_sorted_words = (search_phrase: string) =>
  _.chain(search_phrase)
    .split(" ")
    .uniq()
    .sortBy((word) => -word.length)
    .value();

const search_phrase_to_all_words_regex = (search_phrase: string) =>
  _.chain(search_phrase)
    .thru(clean_phrase)
    .thru(get_length_sorted_words)
    .reduce((pattern, word) => pattern + `(?=.*?${word})`, "^")
    .thru((pattern) => new RegExp(pattern, "i"))
    .value();

const search_phrase_to_any_word_regex = (search_phrase: string) =>
  _.chain(search_phrase)
    .thru(clean_phrase)
    .thru(get_length_sorted_words)
    .join("|")
    .thru((pattern) => new RegExp(`(${pattern})`, "ig"))
    .value();

const highlight_search_match = (search: string, content: string) =>
  _.replace(
    content,
    search_phrase_to_any_word_regex(search),
    "<strong>$1</strong>"
  );

const SearchHighlighter = ({
  search,
  content,
}: {
  search: string;
  content: string;
}) => {
  const split_token = "Ø";
  const string_split_on_matched_words = _.chain(content)
    .replace(
      search_phrase_to_any_word_regex(search),
      `${split_token}$1${split_token}`
    )
    .split(split_token)
    .value();

  return (
    <span>
      {_.map(string_split_on_matched_words, (sub_string, ix) =>
        ix % 2 === 0 ? (
          <span key={ix}>{sub_string}</span>
        ) : (
          <mark key={ix} className="typeahead__highlight">
            {sub_string}
          </mark>
        )
      )}
    </span>
  );
};

const format_data = <Data extends unknown>(
  name_function: (data: Data) => string,
  menu_content_function:
    | undefined
    | ((
        data: Data,
        search: string,
        name_function: (data: Data) => string
      ) => React.ReactNode),
  data: Data,
  config_group_name: string
) => ({
  data,
  name: name_function(data),
  menu_content: (search: string) => {
    if (typeof menu_content_function !== "undefined") {
      return menu_content_function(data, search, name_function);
    } else {
      return (
        <SearchHighlighter search={search} content={name_function(data)} />
      );
    }
  },
  config_group_name,
});

export {
  search_phrase_to_all_words_regex,
  search_phrase_to_any_word_regex,
  highlight_search_match,
  SearchHighlighter,
  format_data,
};
