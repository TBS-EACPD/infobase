import React from "react";
import FocusLock from "react-focus-lock";

import "./Sidebar.scss";

import { CSSTransition } from "react-transition-group";

import { IconX } from "src/icons/icons";

interface SidebarProps {
  is_open: boolean;
  callback: (value: boolean) => void;
  children: React.ReactElement;
  title_text: string;
  sidebar_toggle_target: string;
  return_focus_target: HTMLElement | undefined;
  keydown_close: () => void;
  keydown_close_value: boolean;
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
      this.props.keydown_close();
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

    const target = (e.target as HTMLElement).closest(sidebar_toggle_target);
    if (!target && is_open) {
      this.closeSidebar(e);
    }
  };

  render() {
    const {
      is_open,
      children,
      title_text,
      return_focus_target,
      keydown_close_value,
    } = this.props;
    return (
      <div ref={this.sidebar_ref}>
        <CSSTransition
          in={is_open}
          timeout={1000}
          classNames="slide"
          appear
          mountOnEnter
          unmountOnExit
          onEnter={() => {
            this.title.current?.focus();
          }}
        >
          <div className={"sidebar__wrapper"}>
            <FocusLock
              onDeactivation={() => {
                if (keydown_close_value) {
                  return_focus_target?.focus({ preventScroll: true });
                }
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
                  <h1 ref={this.title} tabIndex={-1}>
                    {title_text}
                  </h1>
                </div>
                {children}
              </aside>
            </FocusLock>
          </div>
        </CSSTransition>
      </div>
    );
  }
}
