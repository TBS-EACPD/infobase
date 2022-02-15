import React from "react";

import { withRouter } from "react-router-dom";

import type { RouteComponentProps } from "react-router-dom";

import { SidebarButton, Sidebar } from "src/components";

import { GlossarySidebar } from "./GlossarySidebar";

const routes_without_glossary = ["/start", "/glossary"];

interface GlossarySidebarControllerState {
  is_open: boolean;
  glossary_item_key: string;
  show_definition: boolean;
}

const GlossarySidebarController = withRouter(
  class GlossarySidebarController extends React.Component<
    RouteComponentProps,
    GlossarySidebarControllerState
  > {
    menu_ref = React.createRef<HTMLDivElement>();

    constructor(props: RouteComponentProps) {
      super(props);
      this.state = {
        is_open: false,
        glossary_item_key: "",
        show_definition: true,
      };
    }
    itemClick = (e: HTMLElement) => {
      const target = e;
      const glossary_item_key = target.dataset.ibttGlossaryKey;

      if (glossary_item_key) {
        this.setGlossaryItem(glossary_item_key);
      }

      this.toggleDefinition(false);

      this.toggleGlossary(true);

      (
        document.querySelector(`glossary-sb__item-title`) as HTMLDivElement
      )?.focus();
    };

    closeSidebar = (e: Event) => {
      const menu_node = this.menu_ref.current;
      if (
        this.state.is_open &&
        menu_node &&
        !menu_node.contains(e.target as HTMLElement)
      ) {
        this.setState({ is_open: false });
      }
    };

    handleWindowClick = (e: Event) => {
      const target = (e.target as HTMLElement).closest(
        "[data-toggle=glossary_sidebar]"
      );
      target ? this.itemClick(target as HTMLElement) : this.closeSidebar(e);
    };

    handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
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

    toggleGlossary(value: boolean) {
      this.setState({
        is_open: value,
      });
    }

    setGlossaryItem(key: string) {
      this.setState({
        glossary_item_key: key,
        show_definition: false,
      });
    }

    toggleDefinition(value: boolean) {
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
                glossary_item_key={this.state.glossary_item_key}
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
              (
                document.querySelector(
                  `.glossary-sb__search-bar > input`
                ) as HTMLElement
              )?.focus()
            }
          />
        </div>
      );
    }
  }
);

export { GlossarySidebarController };
