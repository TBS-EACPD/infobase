import React from "react";

import "intersection-observer";

import { FloatingButton } from "src/components/FloatingButton/FloatingButton";

interface SidebarButtonProps {
  open_sidebar: () => void;
  left: boolean;
  focus: () => void;
}

export class SidebarButton extends React.Component<SidebarButtonProps> {
  constructor(props: SidebarButtonProps) {
    super(props);
  }

  handleClick() {
    this.props.open_sidebar();

    this.props.focus();
  }

  render() {
    return (
      <FloatingButton
        text={"glossary_button"}
        showWithScroll={false}
        left={this.props.left}
        handleClick={() => this.handleClick()}
      />
    );
  }
}
