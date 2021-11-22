import React from "react";

import { withRouter } from "react-router-dom";

import { glossaryEntryStore } from "src/models/glossary";

import { BackToTop } from "src/components";

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
      };

      this.menu_ref = React.createRef();
    }
    itemClick = (e) => {
      const target = e;
      const glossary_item_key = target.dataset.ibttGlossaryKey;
      const glossary_item = glossaryEntryStore.lookup(glossary_item_key);

      this.setGlossaryItem(glossary_item.id);
      this.showList(false);

      this.toggleGlossary(true);
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
      e.target.getAttribute("data-toggle") === "tooltip"
        ? this.itemClick(e.target)
        : e.target.parentElement.getAttribute("data-toggle") === "tooltip"
        ? this.itemClick(e.target.parentElement)
        : this.closeSidebar(e);
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

    showList(value) {
      this.setState({
        showList: value,
      });
    }

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
            setList={(value) => this.showList(value)}
          />
          <BackToTop
            focus={() => {
              document.querySelector(".glossary__search-bar > input").focus();
            }}
            handleClick={() => {
              this.setState({ showGlossary: true });
            }}
            text={"glossary_button"}
            showWithScroll={false}
          />
        </div>
      );
    }
  }
);

export { SidebarActivator };
