import React from "react";

import { Typeahead } from "src/components/index";

import { SideBarSearch } from "src/glossary/SideBarSearch";

interface SelectInputProps {
  type: string;
  on_query: (serach_phrase: string) => void;
  query_value: string;
  results: [];
  still_loading_results: boolean;
  getResults?: (data: []) => void;
}

interface SelectInputState {
  input_value: string;
}

export class SelectInput extends React.Component<
  SelectInputProps,
  SelectInputState
> {
  constructor(props: SelectInputProps) {
    super(props);
  }

  render() {
    const { on_query, query_value, results, still_loading_results } =
      this.props;

    switch (this.props.type) {
      case "typeahead": {
        return (
          <Typeahead
            {...this.props}
            on_query={on_query}
            query_value={query_value}
            results={results}
            loading_results={still_loading_results}
          />
        );
      }
      case "glossary-sidebar": {
        return (
          <SideBarSearch
            {...this.props}
            on_query={on_query}
            query_value={query_value}
            results={results}
            loading_results={still_loading_results}
          />
        );
      }
    }
  }
}
