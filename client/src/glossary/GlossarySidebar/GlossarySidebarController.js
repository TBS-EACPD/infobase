import React from "react";

import { withRouter } from "react-router-dom";

import { SidebarButton, Sidebar } from "src/components";

import { GlossarySidebar } from "./GlossarySidebar";

const routes_without_glossary = ["/start", "/glossary"];

const GlossaryMenuController = withRouter(
  class GlossaryMenuController extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        is_open: false,
        glossary_item_key: null,
        show_definition: true,
      };

      this.menu_ref = React.createRef();
    }
    itemClick = (e) => {
      const target = e;
      const glossary_item_key = target.dataset.ibttGlossaryKey;

      this.setGlossaryItem(glossary_item_key);
      this.toggleDefinition(false);

      this.toggleGlossary(true);
      document.querySelector(`glossary-sb__item-title`).focus();
    };

    closeSidebar = (e) => {
      const menu_node = this.menu_ref.current;
      if (this.state.is_open && menu_node && !menu_node.contains(e.target)) {
        this.setState({ is_open: false });
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
        is_open: value,
      });
    }

    setGlossaryItem(key) {
      this.setState({
        glossary_item_key: key,
        show_definition: false,
      });
    }

    toggleDefinition(value) {
      this.setState({
        show_definition: value,
      });
    }

    render() {
      const currentPage = this.props.location.pathname;

      if (routes_without_glossary.includes(currentPage)) return null;

      return (
        <div ref={this.menu_ref}>
          <Sidebar
            is_open={this.state.is_open}
            close_callback={() => this.toggleGlossary(false)}
            children={
              <GlossarySidebar
                item={this.state.glossary_item_key}
                open_definition={(key) => this.setGlossaryItem(key)}
                show_definition={this.state.show_definition}
                toggle_definition={(value) => this.toggleDefinition(value)}
              />
            }
          />
          <SidebarButton
            open_sidebar={() => this.toggleGlossary(true)}
            left={false}
            focus={() =>
              document.querySelector(`.glossary-sb__search-bar > input`).focus()
            }
          />
        </div>
      );
    }
  }
);

export { GlossaryMenuController };
