import classNames from "classnames";
import React from "react";

import "intersection-observer";

import { is_mobile } from "src/core/feature_detection";

import "./FloatingButton.scss";

interface FloatingButtonProps {
  handleClick: () => void;
  button_text: string;
  showWithScroll: boolean;
  tabIndex: number;
}
interface FloatingButtonState {
  show_floating_button: boolean;
  caught_by_footer: boolean;
}

export class FloatingButton extends React.Component<
  FloatingButtonProps,
  FloatingButtonState
> {
  page_header: HTMLElement | null | undefined;
  page_footer: HTMLElement | null | undefined;
  header_observer: IntersectionObserver | undefined;
  footer_observer: IntersectionObserver | undefined;
  button_ref: React.RefObject<HTMLButtonElement>;

  constructor(props: FloatingButtonProps) {
    super(props);

    this.state = {
      show_floating_button: true,
      caught_by_footer: false,
    };
    this.button_ref = React.createRef();
  }

  componentDidMount() {
    if (this.props.showWithScroll) {
      this.page_header = document.getElementById("ib-site-header-area");

      this.header_observer = new IntersectionObserver((entries, _observer) => {
        this.setState({
          show_floating_button: entries[0].intersectionRatio <= 0,
        });
      });
      if (this.page_header && this.header_observer) {
        this.header_observer.observe(this.page_header);
      }
    }
    this.page_footer = document.getElementById("wb-info");
    this.footer_observer = new IntersectionObserver((entries, _observer) => {
      this.setState({
        caught_by_footer: entries[0].isIntersecting,
      });
    });
    if (this.page_footer && this.footer_observer) {
      this.footer_observer.observe(this.page_footer);
    }
  }
  componentWillUnmount() {
    if (this.page_header && this.header_observer) {
      this.header_observer.unobserve(this.page_header);
    }
    if (this.page_footer && this.footer_observer) {
      this.footer_observer.unobserve(this.page_footer);
    }
  }

  handleClick() {
    this.props.handleClick();
  }

  render() {
    const { show_floating_button, caught_by_footer } = this.state;
    const { tabIndex, button_text } = this.props;
    return (
      <button
        ref={this.button_ref}
        className={classNames(
          "btn",
          "btn-ib-primary",
          "floating-button",
          show_floating_button && "floating-button--shown",
          !caught_by_footer && "floating-button--fixed",
          caught_by_footer && "floating-button--caught"
        )}
        style={{
          top:
            caught_by_footer && this.page_footer
              ? `${this.page_footer.offsetTop - 50}px`
              : "auto",
          opacity:
            caught_by_footer && is_mobile() && window.innerWidth <= 600
              ? 0
              : undefined,
        }}
        tabIndex={tabIndex}
        onClick={() => this.props.handleClick()}
      >
        {button_text}
      </button>
    );
  }
}
