import _ from "lodash";
import React from "react";

import { escapeRegExp } from "src/general_utils";

const phrase_to_word_regex = (query: string, regex_options = "gi") =>
  _.chain(query)
    .deburr()
    .thru(escapeRegExp)
    .split(" ")
    .sortBy((word) => -word.length)
    .join("|")
    .thru((pattern) => new RegExp(`(${pattern})(?![^<]*>)`, regex_options))
    .value();

const highlight_search_match = (search: string, content: string) =>
  _.replace(content, phrase_to_word_regex(search), "<strong>$1</strong>");

const SearchHighlighter = ({
  search,
  content,
}: {
  search: string;
  content: string;
}) => {
  const split_token = "Ø";
  const string_split_on_matched_words = _.chain(content)
    .replace(phrase_to_word_regex(search), `${split_token}$1${split_token}`)
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
  phrase_to_word_regex,
  highlight_search_match,
  SearchHighlighter,
  format_data,
};
