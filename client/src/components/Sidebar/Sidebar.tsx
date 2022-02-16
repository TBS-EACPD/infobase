import React from "react";
import FocusLock from "react-focus-lock";

import "./Sidebar.scss";

import { CSSTransition } from "react-transition-group";

import { FloatingButton } from "src/components/FloatingButton/FloatingButton";

import { IconX } from "src/icons/icons";

interface SidebarProps {
  is_open: boolean;
  callback: (value: boolean) => void;
  children: React.ReactElement;
  button_text: string;
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
    this.props.callback(false);
  }

  render() {
    const { is_open, children, button_text } = this.props;
    return (
      <div>
        <FocusLock>
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
                    onClick={() => this.props.callback(false)}
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
        </FocusLock>
        <FloatingButton
          button_text={button_text}
          showWithScroll={false}
          handleClick={() => this.props.callback(true)}
          tabIndex={0}
        />
      </div>
    );
  }
}
