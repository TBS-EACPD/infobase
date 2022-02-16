import React from "react";

import {
  DebouncedTextInput,
  create_text_maker_component,
} from "src/components";

import glossary_text from "src/glossary/glossary.yaml";

import { IconSearch } from "src/icons/icons";

const { text_maker } = create_text_maker_component(glossary_text);

const SideBarSearchDefaultProps = {
  placeholder: text_maker("glossary_placeholder"),
};

type SideBarSearchProps = typeof SideBarSearchDefaultProps & {
  setQuery: (str: string) => void;
  set_glossary_item: (key: string) => void;
  search_phrase: string;
};

export class SideBarSearch extends React.Component<SideBarSearchProps> {
  static defaultProps = SideBarSearchDefaultProps;

  constructor(props: SideBarSearchProps) {
    super(props);
  }

  callback = (query: string) => {
    this.props.setQuery(query);
    this.props.set_glossary_item("");
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
