import React from "react";

import { withRouter } from "react-router-dom";

import type { RouteComponentProps } from "react-router-dom";

import { GlossarySidebar } from "./GlossarySidebar";

const routes_without_glossary = ["/start", "/glossary"];

interface GlossarySidebarControllerState {
  is_open: boolean;
  glossary_item_key: string;
  focus_item_key: string;
  return_focus_target: HTMLElement | undefined;
  search_phrase: string;
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
        focus_item_key: "",
        return_focus_target: undefined,
        search_phrase: "",
      };
    }
    itemClick = (e: HTMLElement) => {
      const target = e;
      const glossary_item_key = target.dataset.ibttGlossaryKey;

      if (glossary_item_key) {
        this.setGlossaryItem(glossary_item_key);
      }

      this.setState({
        return_focus_target: e,
      });

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
        this.state.return_focus_target?.focus();
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
      window.addEventListener("mousedown", this.handleWindowClick, {
        capture: true,
      });
      window.addEventListener("keydown", this.handleWindowKeyDown, {
        capture: true,
      });
    }

    componentWillUnmount() {
      window.removeEventListener("mousedown", this.handleWindowClick, {
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
      if (!value) {
        this.state.return_focus_target?.focus();
      }
    }

    setGlossaryItem(key: string) {
      this.setState({
        glossary_item_key: key,
        focus_item_key: key ? key : this.state.focus_item_key,
      });
    }

    setQuery(query: string) {
      this.setState({
        search_phrase: query,
      });
    }

    render() {
      const currentPage = this.props.location.pathname;

      if (routes_without_glossary.includes(currentPage)) return null;

      return (
        <div ref={this.menu_ref}>
          <GlossarySidebar
            glossary_item_key={this.state.glossary_item_key}
            focus_item_key={this.state.focus_item_key}
            set_glossary_item={(key) => this.setGlossaryItem(key)}
            set_query={(query) => this.setQuery(query)}
            search_phrase={this.state.search_phrase}
            is_open={this.state.is_open}
            toggle_glossary={(value) => this.toggleGlossary(value)}
          />
        </div>
      );
    }
  }
);

export { GlossarySidebarController };
