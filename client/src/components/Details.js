import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { lang } from "src/core/injected_build_constants";

import "./Details.scss";

export const StatelessDetails = ({
  summary_content,
  content,
  persist_content,
  on_click,
  is_open,
}) => {
  const aria_labels = {
    en: {
      open: "Content follows, activate to collapse content",
      closed: "Activate to expand content",
    },
    fr: {
      open: "Le contenu suit, activez pour réduire le contenu",
      closed: "Actiavte pour élargir le contenu",
    },
  };

  const label_id = _.uniqueId("IBDetails__a11yLabel");

  return (
    <div className="IBDetails">
      <button
        className={classNames(
          "IBDetails__Summary",
          is_open && "IBDetails__Summary--open"
        )}
        onClick={on_click}
        aria-labelledby={label_id}
      >
        <span aria-hidden className="IBDetails__TogglerIcon">
          {is_open ? "▼" : "►"}
        </span>
        <span id={label_id}>
          {summary_content}
          <span className="sr-only">
            {aria_labels[lang][is_open ? "open" : "closed"]}
          </span>
        </span>
      </button>
      <div
        className={classNames(
          "IBDetails__content",
          `IBDetails__content--${is_open ? "open" : "closed"}`
        )}
      >
        {(is_open || persist_content) && content}
      </div>
    </div>
  );
};

export class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_open: props.initial_open || false,
    };
  }
  on_click = () => this.setState({ is_open: !this.state.is_open });
  render() {
    const { summary_content, content, persist_content } = this.props;
    const { is_open } = this.state;
    return (
      <StatelessDetails
        {...{
          summary_content,
          content,
          persist_content,
          on_click: this.on_click,
          is_open,
        }}
      />
    );
  }
}
