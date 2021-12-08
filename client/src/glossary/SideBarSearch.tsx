import React from "react";

import { DebouncedTextInput } from "src/components";

import { IconSearch } from "src/icons/icons";

const SideBarSearchDefaultProps = {
  placeholder: "Search",
};

type SideBarSearchProps = typeof SideBarSearchDefaultProps & {
  on_query: (str: string) => void;
  query_value: string;
  results: [];
  loading_results?: boolean;
  getResults?: (data: []) => void;
  setQuery?: (query: string) => void;
};

export class SideBarSearch extends React.Component<SideBarSearchProps> {
  static defaultProps = SideBarSearchDefaultProps;

  constructor(props: SideBarSearchProps) {
    super(props);
  }

  callback = (query: string) => {
    this.props.on_query(query);
  };

  componentDidUpdate() {
    if (!this.props.loading_results) {
      if (this.props.getResults && this.props.setQuery) {
        this.props.getResults(this.props.results);
        this.props.setQuery(this.props.query_value);
      }
    }
  }

  shouldComponentUpdate(nextProps: Record<string, unknown>) {
    if (nextProps.loading_results !== this.props.loading_results) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    const { placeholder } = this.props;

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
