import _ from "lodash";
import React from "react";

import { escapeRegExp } from "src/general_utils";

const query_to_regexps_func = (query: string) => {
  const raw_tokens = _.filter(query.split(" "));
  const reg_exps = _.map(
    raw_tokens,
    (token) => new RegExp(`${escapeRegExp(_.deburr(token))}(?![^<]*>)`, "gi")
  );
  return reg_exps;
};
const query_to_reg_exps = _.memoize(query_to_regexps_func);

// Used where Highlighter component can't be, e.g. where searched string already
// contains markup and will need to be rendered with dangerouslySetInnerHTML
const highlight_search_match = (search: string, content: string) => {
  const reg_exps = query_to_reg_exps(search);

  let modified_string = _.clone(content);
  _.each(
    reg_exps,
    (reg_exp) =>
      (modified_string = modified_string.replace(
        reg_exp,
        (match) => `<strong>${match}</strong>`
      ))
  );

  return modified_string;
};

const split_matched_search_tokens = (search: string, content: string) => {
  const reg_exps = query_to_reg_exps(search);

  const split_token = "Ø";

  let modified_string = _.clone(content);
  _.each(
    reg_exps,
    (reg_exp) =>
      (modified_string = modified_string.replace(
        reg_exp,
        (match) => `${split_token}${match}${split_token}`
      ))
  );

  const split_string = _.split(modified_string, split_token);

  return split_string;
};

const InfoBaseHighlighter = ({
  search,
  content,
}: {
  search: string;
  content: string;
}) => {
  const string_split_on_matched_tokens = split_matched_search_tokens(
    search,
    content
  );

  return (
    <span>
      {_.map(string_split_on_matched_tokens, (sub_string, ix) =>
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
        <InfoBaseHighlighter search={search} content={name_function(data)} />
      );
    }
  },
  config_group_name,
});

export {
  query_to_reg_exps,
  highlight_search_match,
  InfoBaseHighlighter,
  format_data,
};
