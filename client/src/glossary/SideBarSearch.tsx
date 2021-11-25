/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";
import React from "react";

import { DebouncedTextInput } from "src/components";

import { IconSearch } from "src/icons/icons";

const SideBarSearchDefaultProps = {
  placeholder: "Search",
};

type SideBarSearchProps = typeof SideBarSearchDefaultProps & {
  on_query: (str: string) => void;
  query_value: string;
  results: any;
  loading_results?: boolean;
  getResults?: any;
  setQuery?: any;
};

interface SideBarSearchState {
  input_value: string;
}

export class SideBarSearch extends React.Component<
  SideBarSearchProps,
  SideBarSearchState
> {
  static defaultProps = SideBarSearchDefaultProps;

  constructor(props: SideBarSearchProps) {
    super(props);
  }

  callback = (query: any) => {
    this.props.on_query(query);
    this.props.getResults(this.props.results);
    this.props.setQuery(this.props.query_value);
  };

  render() {
    const { placeholder, on_query } = this.props;

    return (
      <div className={"glossary__search-bar"}>
        <div className={"glossary__icon-container"}>
          <span aria-hidden="true">
            <IconSearch width="30px" color="#2C70C9" alternate_color={false} />
          </span>
        </div>
        <DebouncedTextInput
          placeHolder={placeholder}
          updateCallback={this.callback}
        />
      </div>
    );
  }
}
