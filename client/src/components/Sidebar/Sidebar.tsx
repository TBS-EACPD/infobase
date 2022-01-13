import classNames from "classnames";
import type { JSXElementConstructor, ReactNode } from "react";
import React from "react";

import "./Sidebar.scss";

import { IconX } from "src/icons/icons";

interface SidebarProps {
  is_open: boolean;
  close_callback: () => void;
  children: React.ReactElement;
}

export class Sidebar extends React.Component<SidebarProps> {
  constructor(props: SidebarProps) {
    super(props);
  }

  handleKeyPress(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === "Enter") {
      this.props.close_callback();
    }
  }

  render() {
    const { is_open, children } = this.props;
    return (
      <div className={classNames("sidebar__wrapper", is_open && "active")}>
        <aside className="sidebar">
          <div className={"sidebar__icon-wrapper"}>
            <span
              role="button"
              className="sidebar__close-button"
              onClick={() => this.props.close_callback()}
              onKeyDown={(e) => this.handleKeyPress(e)}
              tabIndex={0}
            >
              <IconX width="25px" color="white" alternate_color={false} />
            </span>
          </div>
          {children}
        </aside>
      </div>
    );
  }
}
