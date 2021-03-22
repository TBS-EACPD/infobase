import classNames from "classnames";
import React from "react";

import "intersection-observer";

import { trivial_text_maker } from "src/models/text.js";

import { is_mobile } from "src/core/feature_detection.js";

import "./BackToTop.scss";

export class BackToTop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show_back_to_top: false,
      caught_by_footer: false,
    };

    this.button_ref = React.createRef();
  }

  componentDidMount() {
    this.page_header = document.getElementById("ib-site-header-area");
    this.page_footer = document.getElementById("wb-info");

    this.header_observer = new IntersectionObserver((entries, observer) => {
      this.setState({ show_back_to_top: entries[0].intersectionRatio <= 0 });
    });
    this.header_observer.observe(this.page_header);

    this.footer_observer = new IntersectionObserver((entries, observer) => {
      this.setState({
        caught_by_footer: is_mobile()
          ? window.innerWidth > 600
            ? window.pageYOffset + window.innerHeight >=
              this.page_footer.offsetTop
            : entries[0].isIntersecting
          : entries[0].isIntersecting,
      });
    });
    this.footer_observer.observe(this.page_footer);
  }
  componentWillUnmount() {
    this.header_observer.unobserve(this.page_header);
    this.footer_observer.unobserve(this.page_footer);
  }

  handleClick() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    document.querySelector(this.props.focus).focus();
  }

  render() {
    const { show_back_to_top, caught_by_footer } = this.state;
    return (
      <button
        ref={this.button_ref}
        className={classNames(
          "btn",
          "btn-ib-primary",
          "back-to-top",
          show_back_to_top && "back-to-top--shown",
          !caught_by_footer && "back-to-top--fixed",
          caught_by_footer && "back-to-top--caught"
        )}
        style={{
          top: caught_by_footer
            ? `${this.page_footer.offsetTop - 50}px`
            : "auto",
          opacity:
            caught_by_footer && is_mobile() && window.innerWidth <= 600
              ? 0
              : undefined,
        }}
        tabIndex="-1"
        onClick={() => this.handleClick()}
      >
        {trivial_text_maker("back_to_top")}
      </button>
    );
  }
}
