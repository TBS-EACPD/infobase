import React from "react";

import "intersection-observer";

import { FloatingButton } from "src/components/FloatingButton/FloatingButton";

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
        text={"back_to_top"}
        showWithScroll={true}
        left={false}
        handleClick={() => this.handleClick()}
      />
    );
  }
}
