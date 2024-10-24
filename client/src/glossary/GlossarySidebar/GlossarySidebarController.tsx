import React from "react";

import { withRouter } from "react-router-dom";

import type { RouteComponentProps } from "react-router-dom";

import { FloatingButton, create_text_maker_component } from "src/components";

import glossary_text from "src/glossary/glossary.yaml";

import { IconGlossary } from "src/icons/icons";

import { textLightColor } from "src/style_constants/index";

import { GlossarySidebar } from "./GlossarySidebar";

const routes_without_glossary = ["/start", "/glossary"];

const { text_maker } = create_text_maker_component(glossary_text);

interface GlossarySidebarControllerState {
  is_open: boolean;
  glossary_item_key: string;
  focus_item_key: string;
  return_focus_target: HTMLElement | null;
  search_phrase: string;
}

const GlossarySidebarController = withRouter(
  class GlossarySidebarController extends React.Component<
    RouteComponentProps,
    GlossarySidebarControllerState
  > {
    constructor(props: RouteComponentProps) {
      super(props);
      this.state = {
        is_open: false,
        glossary_item_key: "",
        focus_item_key: "",
        return_focus_target: null,
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
    };

    delegatedClickEvent = (e: Event) => {
      const target = (e.target as HTMLElement).closest(
        "[data-toggle=glossary_sidebar]"
      );
      if (target) {
        this.itemClick(target as HTMLElement);
      }
    };
    delegatedKeydownEvent = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        this.delegatedClickEvent(e);
      }
    };

    componentDidMount() {
      window.addEventListener("click", this.delegatedClickEvent, {
        capture: true,
      });
      window.addEventListener("keydown", this.delegatedKeydownEvent, {
        capture: true,
      });
    }

    componentWillUnmount() {
      window.removeEventListener("click", this.delegatedClickEvent, {
        capture: true,
      });
      window.removeEventListener("keydown", this.delegatedKeydownEvent, {
        capture: true,
      });
    }

    toggleGlossary = (value: boolean) => {
      this.setState({
        is_open: value,
      });
    };

    setGlossaryItem = (key: string) => {
      this.setState({
        glossary_item_key: key,
        focus_item_key: key ? key : this.state.focus_item_key,
      });
    };

    setQuery = (query: string) => {
      this.setState({
        search_phrase: query,
      });
    };

    buttonClick = () => {
      this.toggleGlossary(true);
      this.setState({
        return_focus_target: null,
      });
    };

    render() {
      const currentPage = this.props.location.pathname;

      if (routes_without_glossary.includes(currentPage)) return null;

      return (
        <>
          <GlossarySidebar
            glossary_item_key={this.state.glossary_item_key}
            focus_item_key={this.state.focus_item_key}
            set_glossary_item={this.setGlossaryItem}
            set_query={this.setQuery}
            search_phrase={this.state.search_phrase}
            is_open={this.state.is_open}
            toggle_glossary={this.toggleGlossary}
            return_focus_target={this.state.return_focus_target}
          />
          <FloatingButton
            button_text={text_maker("glossary_title")}
            aria_label={text_maker("open_glossary")}
            showWithScroll={false}
            handleClick={this.buttonClick}
            mobile_icon={
              <IconGlossary
                inline={true}
                aria_hide={true}
                alternate_color={textLightColor}
              />
            }
          />
        </>
      );
    }
  }
);

export { GlossarySidebarController };
