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
  title_text: string;
  sidebar_toggle_target: string;
  return_focus_target: HTMLElement | undefined;
}

export class Sidebar extends React.Component<SidebarProps> {
  title = React.createRef<HTMLDivElement>();
  sidebar_ref = React.createRef<HTMLDivElement>();
  constructor(props: SidebarProps) {
    super(props);
  }

  componentDidMount() {
    window.addEventListener("click", this.handleWindowClick, {
      capture: true,
    });
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.handleWindowClick, {
      capture: true,
    });
  }

  handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      this.props.callback(false);
    }
  }

  closeSidebar = (e: Event) => {
    const sidebar_node = this.sidebar_ref.current;
    if (
      this.props.is_open &&
      sidebar_node &&
      !sidebar_node.contains(e.target as HTMLElement)
    ) {
      this.props.callback(false);
    }
  };

  handleWindowClick = (e: Event) => {
    const { sidebar_toggle_target, is_open } = this.props;
    const selection = window.getSelection();
    if (selection?.type != "Range") {
      const target = (e.target as HTMLElement).closest(sidebar_toggle_target);
      if (!target && is_open) {
        this.closeSidebar(e);
      }
    }
  };

  render() {
    const { is_open, children, button_text, title_text, return_focus_target } =
      this.props;
    return (
      <div ref={this.sidebar_ref}>
        <CSSTransition
          in={is_open}
          timeout={1000}
          classNames="slide"
          appear
          mountOnEnter
          unmountOnExit
          onEntered={() => {
            this.title.current?.focus();
          }}
        >
          <div className={"sidebar__wrapper"}>
            <FocusLock
              onDeactivation={() => {
                return_focus_target?.focus({ preventScroll: true });
              }}
            >
              <aside className="sidebar">
                <div className={"sidebar__icon-wrapper"}>
                  <span
                    role="button"
                    className="sidebar__close-button"
                    onClick={() => this.props.callback(false)}
                    onKeyDown={(e) => this.handleKeyPress(e)}
                    tabIndex={0}
                  >
                    <IconX width="25px" color="white" alternate_color={false} />
                  </span>
                </div>
                <div className={"sidebar__title"}>
                  <h1
                    ref={this.title}
                    /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
                    tabIndex={0}
                  >
                    {title_text}
                  </h1>
                </div>
                {children}
              </aside>
            </FocusLock>
          </div>
        </CSSTransition>

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
