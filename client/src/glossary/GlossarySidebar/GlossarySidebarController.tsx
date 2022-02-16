import React from "react";

import { withRouter } from "react-router-dom";

import type { RouteComponentProps } from "react-router-dom";

import { Sidebar, create_text_maker_component } from "src/components";

import glossary_text from "src/glossary/glossary.yaml";

import { GlossarySidebar } from "./GlossarySidebar";

const { text_maker } = create_text_maker_component(glossary_text);

const routes_without_glossary = ["/start", "/glossary"];

interface GlossarySidebarControllerState {
  is_open: boolean;
  glossary_item_key: string;
  show_definition: boolean;
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
        show_definition: true,
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
        console.log(this.state.return_focus_target);
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
        show_definition: false,
      });
    }

    toggleDefinition(value: boolean) {
      this.setState({
        show_definition: value,
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
          <Sidebar
            is_open={this.state.is_open}
            callback={(value: boolean) => this.toggleGlossary(value)}
            button_text={text_maker("glossary_title")}
            title_text={text_maker("glossary_title")}
            children={
              <GlossarySidebar
                glossary_item_key={this.state.glossary_item_key}
                open_definition={(key) => this.setGlossaryItem(key)}
                show_definition={this.state.show_definition}
                toggle_definition={(value) => this.toggleDefinition(value)}
                set_query={(query) => this.setQuery(query)}
                search_phrase={this.state.search_phrase}
              />
            }
          />
        </div>
      );
    }
  }
);

export { GlossarySidebarController };
