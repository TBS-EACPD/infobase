import React from "react";

import { DebouncedTextInput } from "src/components";

import { IconSearch } from "src/icons/icons";

const SideBarSearchDefaultProps = {
  placeholder: "Search",
};

type SideBarSearchProps = typeof SideBarSearchDefaultProps & {
  setQuery: (str: string) => void;
  search_phrase: string;
};

export class SideBarSearch extends React.Component<SideBarSearchProps> {
  static defaultProps = SideBarSearchDefaultProps;

  constructor(props: SideBarSearchProps) {
    super(props);
  }

  callback = (query: string) => {
    this.props.setQuery(query);
  };

  render() {
    const { placeholder, search_phrase } = this.props;

    return (
      <div className={"glossary-sb__search-bar"}>
        <div className={"glossary-sb__icon-container"}>
          <span aria-hidden="true">
            <IconSearch width="30px" color="#2C70C9" alternate_color={false} />
          </span>
        </div>
        <DebouncedTextInput
          placeHolder={placeholder}
          updateCallback={this.callback}
          defaultValue={search_phrase}
        />
      </div>
    );
  }
}
