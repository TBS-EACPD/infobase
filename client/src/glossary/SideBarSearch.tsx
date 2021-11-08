import _ from "lodash";
import React from "react";

import { DebouncedTextInput } from "src/components";

import { IconSearch } from "src/icons/icons";

const SideBarSearchDefaultProps = {
  placeholder: "Search",
};

type SideBarSearchProps = typeof SideBarSearchDefaultProps & {
  on_query: (str: string) => void;
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
          updateCallback={on_query}
        />
      </div>
    );
  }
}
