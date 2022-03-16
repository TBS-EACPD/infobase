import React from "react";
import FocusLock from "react-focus-lock";

import "./Sidebar.scss";

import { CSSTransition } from "react-transition-group";

import { trivial_text_maker } from "src/models/text";

import { IconX } from "src/icons/icons";

interface SidebarProps {
  is_open: boolean;
  open_close_callback: (value: boolean) => void;
  children: React.ReactNode;
  title_text: string;
  sidebar_toggle_target: string;
  return_focus_target: HTMLElement | null;
}

export class Sidebar extends React.Component<SidebarProps> {
  title = React.createRef<HTMLDivElement>();
  sidebar_ref = React.createRef<HTMLDivElement>();
  private key_down = false;
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

  closeSidebar = (e: Event) => {
    const sidebar_node = this.sidebar_ref.current;
    if (
      this.props.is_open &&
      sidebar_node &&
      !sidebar_node.contains(e.target as HTMLElement)
    ) {
      this.props.open_close_callback(false);
    }
  };

  handleWindowClick = (e: Event) => {
    const { sidebar_toggle_target, is_open } = this.props;

    const target = (e.target as HTMLElement).closest(sidebar_toggle_target);
    if (!target && is_open) {
      this.closeSidebar(e);
    }
  };

  closeButtonClick = (e: React.MouseEvent) => {
    //Hacky solution to differentiate between keyboard and mouse click
    this.key_down = e.detail === 0;
    this.props.open_close_callback(false);
  };

  render() {
    const { is_open, children, title_text, return_focus_target } = this.props;
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
                if (this.key_down) {
                  return_focus_target?.focus({ preventScroll: true });
                }
              }}
            >
              <aside className="sidebar">
                <div className={"sidebar__icon-wrapper"}>
                  <button
                    className="sidebar__close-button"
                    aria-label={trivial_text_maker("close")}
                    onClick={(e) => {
                      this.closeButtonClick(e);
                    }}
                  >
                    <IconX width="25px" color="white" alternate_color={false} />
                  </button>
                </div>
                <div className={"sidebar__title"}>
                  <h1 ref={this.title} tabIndex={-1}>
                    {title_text}
                  </h1>
                </div>
                <>{children}</>
              </aside>
            </FocusLock>
          </div>
        </CSSTransition>
      </div>
    );
  }
}
