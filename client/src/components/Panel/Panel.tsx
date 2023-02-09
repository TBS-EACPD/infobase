import classNames from "classnames";
import React from "react";

import { create_text_maker } from "src/models/text";

import { textLightColor } from "src/style_constants/index";

import text from "./Panel.yaml";
import "./Panel.scss";
import { StatelessDetails } from "../Details/Details";
import { Concast } from "@apollo/client/utilities";

const text_maker = create_text_maker(text);




type PanelProps = {
  isOpen: boolean;
  allowOverflow: boolean;
  title: string;
  otherHeaderContent: JSX.Element;
}

interface isOpenInterface {
  isOpen: boolean;
}
export class Panel extends React.Component<PanelProps,isOpenInterface> {
  
  constructor(props: PanelProps) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }
  render() {
    const { isOpen } = this.state;
    const { allowOverflow, title, otherHeaderContent, children } = this.props;

    return (
      <section
        className={classNames(
          "panel panel-info mrgn-bttm-md",
          allowOverflow && "panel-overflow"
        )}
      >
        {(title || otherHeaderContent) && (
          <header className="panel-heading">
            {
              <button
                className={classNames("panel-heading-utils")}
                onClick={() => this.setState({ isOpen: !isOpen })}
                aria-label={
                  isOpen
                    ? text_maker("collapse_panel")
                    : text_maker("expand_panel")
                }
              >
                <span style={{ color: textLightColor }} aria-hidden>
                  {isOpen ? "▼" : "►"}
                </span>
              </button>
            }
            {title && <h2 className="panel-title">{title}</h2>}
            {isOpen && otherHeaderContent}
          </header>
        )}
        {isOpen && <div className="panel-body">{children}</div>}
      </section>
    );
  }
}
