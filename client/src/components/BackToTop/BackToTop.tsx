import React from "react";

import "intersection-observer";

import { FloatingButton } from "src/components/FloatingButton/FloatingButton";

import { trivial_text_maker } from "src/models/text";

import { scroll_to_top } from "src/core/NavComponents";

import "./BackToTop.scss";

interface BackToTopProps {
  scroll_target: HTMLElement | null | undefined;
}

export class BackToTop extends React.Component<BackToTopProps> {
  constructor(props: BackToTopProps) {
    super(props);
  }

  handleClick() {
    scroll_to_top(this.props.scroll_target);
  }

  render() {
    return (
      <FloatingButton
        button_text={trivial_text_maker("back_to_top")}
        showWithScroll={true}
        handleClick={() => this.handleClick()}
        tabIndex={-1}
      />
    );
  }
}
