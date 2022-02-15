import React from "react";

import "./Sidebar.scss";

import { CSSTransition } from "react-transition-group";

import { IconX } from "src/icons/icons";

interface SidebarProps {
  is_open: boolean;
  close_callback: () => void;
  children: React.ReactElement;
}

export class Sidebar extends React.Component<SidebarProps> {
  closeButton = React.createRef<HTMLDivElement>();
  constructor(props: SidebarProps) {
    super(props);
  }

  handleKeyPress(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === "Enter") {
      this.close();
    }
  }

  close() {
    this.props.close_callback();
  }

  render() {
    const { is_open, children } = this.props;
    return (
      <CSSTransition
        in={is_open}
        timeout={1000}
        classNames="slide"
        appear
        mountOnEnter
        unmountOnExit
        onEnter={() => this.closeButton.current?.focus()}
      >
        <div className={"sidebar__wrapper"}>
          <aside className="sidebar">
            <div className={"sidebar__icon-wrapper"}>
              <span
                role="button"
                className="sidebar__close-button"
                onClick={() => this.props.close_callback()}
                onKeyDown={(e) => this.handleKeyPress(e)}
                tabIndex={0}
                ref={this.closeButton}
              >
                <IconX width="25px" color="white" alternate_color={false} />
              </span>
            </div>
            {children}
          </aside>
        </div>
      </CSSTransition>
    );
  }
}
