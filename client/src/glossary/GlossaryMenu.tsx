/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";
import React from "react";

import "./GlossaryMenu.scss";

import { lang } from "src/core/injected_build_constants";

import { IconX } from "src/icons/icons";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";

import { SearchConfigTypeahead } from "src/search/SearchConfigTypeahead";

import { SidebarContent } from "./GlossarySidebarContent";

interface GlossaryMenuProps {
  show: boolean;
  toggle: (value: boolean) => void;
  item: ResultProps;
  setGlossaryItem: (key: string) => void;
  showList: boolean;
  setList: (value: boolean) => void;
}

interface GlossaryMenuState {
  show: boolean;
  results: ResultProps[];
  item: ResultProps;
  query: string;
}

export interface ResultProps {
  id: string;
  title: string;
  translation: string;
  raw_definition: string;
  get_compiled_definition: () => string;
}

export class GlossaryMenu extends React.Component<
  GlossaryMenuProps,
  GlossaryMenuState
> {
  main = React.createRef<HTMLDivElement>();
  header = React.createRef<HTMLDivElement>();

  constructor(props: GlossaryMenuProps) {
    super(props);

    this.state = {
      show: this.props.show,
      results: [],
      item: this.props.item,
      query: "",
    };
  }

  static getDerivedStateFromProps(
    nextProps: GlossaryMenuProps,
    prevState: GlossaryMenuState
  ) {
    const { show: next_show, item: next_item } = nextProps;
    const { show: prev_show, item: prev_item } = prevState;

    if (next_show !== prev_show) {
      return {
        show: next_show,
      };
    } else if (next_item !== prev_item) {
      return {
        item: next_item,
      };
    } else {
      return null;
    }
  }

  getResults = (childData: any) => {
    const test = _.map(childData, (data) => ({
      id: data.glossary_data.id,
      title: data.glossary_data.title,
      translation: data.glossary_data.translation,
      raw_definition: data.glossary_data.raw_defintion,
      get_compiled_definition: data.glossary_data.get_compiled_definition,
    }));

    this.setState({
      results: test,
    });
    this.props.setList(true);
  };

  closeItem() {
    this.props.setList(true);
  }

  openItem(key: string) {
    this.props.setGlossaryItem(key);
  }

  handleKeyPress(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === "Enter") {
      this.props.toggle(false);
    }
  }

  setQuery(query: string) {
    this.setState({ query: query });
  }

  render() {
    const glossary_placeholder = {
      en: "Search for a term",
      fr: "Rechercher un terme",
    }[lang];

    const glossary_example = {
      en: 'Example: "Expenditures"',
      fr: 'Exemple: "Dépenses"',
    }[lang];

    const glossary_title = {
      en: "Glossary",
      fr: "Glossaire",
    }[lang];

    return (
      <div
        className={
          this.state.show
            ? "glossary-sidebar-wrapper active"
            : "glossary-sidebar-wrapper"
        }
      >
        <aside
          role="dialog"
          aria-labelledby="glossary-header"
          className="glossary-sidebar"
          ref={this.main}
        >
          <div className="glossary-sidebar-header-wrapper" ref={this.header}>
            <div className="glossary-sidebar-header">
              <div role="navigation" aria-label="Glossary navigation">
                <div className={"close-button"}>
                  <span
                    role="button"
                    className="icon-wrapper"
                    onClick={() => this.props.toggle(false)}
                    onKeyDown={(e) => this.handleKeyPress(e)}
                    tabIndex={0}
                  >
                    <IconX width="25px" color="white" alternate_color={false} />
                  </span>
                </div>
              </div>
              <h1
                id="glossary-header"
                className="glossary-header"
                tabIndex={-1}
              >
                {glossary_title}
              </h1>
              <div className="search-wrapper">
                <SearchConfigTypeahead
                  type={"glossary-sidebar"}
                  placeholder={glossary_placeholder}
                  search_configs={[glossary_search_config]}
                  getResults={(data: ResultProps[]) => this.getResults(data)}
                  setQuery={(query: string) => this.setQuery(query)}
                />
              </div>
              <div className="glossary-example">{glossary_example}</div>
            </div>
          </div>
          <div className="glossary-sidebar-content-wrapper">
            <SidebarContent
              title={this.state.item?.title}
              def={this.state.item?.get_compiled_definition()}
              results={this.state.results}
              closeItem={() => this.closeItem()}
              openItem={(key: string) => this.openItem(key)}
              showList={this.props.showList}
              query={this.state.query}
            />
          </div>
        </aside>
      </div>
    );
  }
}
