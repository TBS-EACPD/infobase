import React from "react";

import _ from "src/app_bootstrap/lodash_mixins.js";
// Allows child content to use full screen width, escaping from gutters such as the main.container or any other .container elements

// Implemented with JS because any css solutions use 100vw, but actual page widths are usually 100vw - vertical scroll bar width...
// meaning most uses of 100vw expand your page by the width of the vertical scroll bar, giving it a horizontal scroll bar and ~16px of uggly right-padding.
// Possible to do with CSS only for modern browsers with styleable scroll bars in theory, but that's out while we still support IE 11
class ContainerEscapeHatch extends React.Component {
  constructor() {
    super();

    this.outer_container_escape_hatch = React.createRef();
    this.inner_container_escape_hatch = React.createRef();

    this.adjust_to_full_page_width = () => {
      const outer_container_escape_hatch = this.outer_container_escape_hatch
        .current;
      const inner_container_escape_hatch = this.inner_container_escape_hatch
        .current;

      const screen_width = document.body.clientWidth;
      const container_width = outer_container_escape_hatch.offsetWidth; // This assumes outer_container_escape_hatch will have the full container width
      const new_escape_hatch_negative_margin_left =
        -0.5 * Math.abs(screen_width - container_width);

      inner_container_escape_hatch.style.width = screen_width + "px";
      inner_container_escape_hatch.style.marginLeft =
        new_escape_hatch_negative_margin_left + "px";
    };

    this.debounced_adjust_to_full_page_width = _.debounce(
      this.adjust_to_full_page_width,
      100
    );
  }
  componentDidMount() {
    this.adjust_to_full_page_width();
    window.addEventListener("resize", this.debounced_adjust_to_full_page_width);
  }
  componentWillUnmount() {
    window.removeEventListener(
      "resize",
      this.debounced_adjust_to_full_page_width
    );
    this.debounced_adjust_to_full_page_width.cancel();
  }
  render() {
    const { children } = this.props;

    return (
      <div
        className={"outer-container-escape-hatch"}
        ref={this.outer_container_escape_hatch}
      >
        <div
          className={"inner-container-escape-hatch"}
          ref={this.inner_container_escape_hatch}
        >
          {children}
        </div>
      </div>
    );
  }
}

export { ContainerEscapeHatch };
