import _ from "lodash";
import React from "react";

import { withRouter } from "react-router-dom";

import { glossaryEntryStore } from "src/models/glossary";

import { SidebarButton } from "src/components";

import { get_glossary_items_by_letter } from "./glossary_utils";

import { GlossaryMenu } from "./GlossaryMenu";

const ROUTES_WITHOUT_GLOSSARY = {
  "/start": true,
  "/glossary": true,
};

const SidebarActivator = withRouter(
  class SidebarActivator extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        show_sidebar: true,
        showGlossary: false,
        glossaryItem: null,
        showList: true,
        results: [],
        query: "",
      };

      this.menu_ref = React.createRef();
    }
    itemClick = (e) => {
      const target = e;
      const glossary_item_key = target.dataset.ibttGlossaryKey;
      const glossary_item = glossaryEntryStore.lookup(glossary_item_key);

      this.setGlossaryItem(glossary_item.id);
      this.setList(false);

      this.toggleGlossary(true);
      document.querySelector(`.glossary__search-bar > input`).focus();
    };

    closeSidebar = (e) => {
      const menu_node = this.menu_ref.current;
      if (
        this.state.showGlossary &&
        menu_node &&
        !menu_node.contains(e.target)
      ) {
        this.setState({ showGlossary: false });
      }
    };

    handleWindowClick = (e) => {
      const target = e.target.closest("[data-toggle=glossary_sidebar]");
      target ? this.itemClick(target) : this.closeSidebar(e);
    };

    handleWindowKeyDown = (e) => {
      if (e.code === "Enter") {
        this.handleWindowClick(e);
      }
    };

    componentDidMount() {
      window.addEventListener("click", this.handleWindowClick, {
        capture: true,
      });
      window.addEventListener("keydown", this.handleWindowKeyDown, {
        capture: true,
      });
    }

    componentWillUnmount() {
      window.removeEventListener("click", this.handleWindowClick, {
        capture: true,
      });
      window.removeEventListener("keydown", this.handleWindowKeyDown, {
        capture: true,
      });
    }

    toggleGlossary(value) {
      this.setState({
        showGlossary: value,
      });
    }

    setGlossaryItem(key) {
      this.setState({
        glossaryItem: glossaryEntryStore.lookup(key),
        showList: false,
      });
    }

    setList(value) {
      this.setState({
        showList: value,
      });
    }

    setQuery(query) {
      this.setState({ query: query });
    }

    setResults = (childData) => {
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
      this.setList(true);
    };

    render() {
      const currentPage = this.props.location.pathname;

      if (ROUTES_WITHOUT_GLOSSARY[currentPage]) return null;

      return (
        <div ref={this.menu_ref}>
          <GlossaryMenu
            show={this.state.showGlossary}
            toggle={(value) => this.toggleGlossary(value)}
            item={this.state.glossaryItem}
            setGlossaryItem={(key) => this.setGlossaryItem(key)}
            showList={this.state.showList}
            setList={(value) => this.setList(value)}
            setResults={(data) => this.setResults(data)}
            setQuery={(query) => this.setQuery(query)}
            results={get_glossary_items_by_letter(this.state.results)}
            query={this.state.query}
          />
          <SidebarButton
            open_sidebar={() => this.toggleGlossary(true)}
            left={false}
            focus={() =>
              document.querySelector(`.glossary__search-bar > input`).focus()
            }
          />
        </div>
      );
    }
  }
);

export { SidebarActivator };
