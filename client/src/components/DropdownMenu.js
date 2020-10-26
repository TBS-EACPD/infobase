import classNames from "classnames";
import React from "react";

import "./DropdownMenu.scss";
import { trivial_text_maker } from "../models/text.js";

export class DropdownMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }
  componentDidUpdate() {
    const { isOpen } = this.state;
    if (isOpen) {
      this.refs.dropdown_area.focus();
    }
  }
  render() {
    const {
      dropdown_content,
      opened_button_class_name,
      closed_button_class_name,
      dropdown_content_class_name,
      button_description,
      dropdown_trigger_txt,
      dropdown_raw_txt,
    } = this.props;
    const { isOpen } = this.state;

    return (
      <div className="dropdown">
        <button
          className={
            isOpen ? opened_button_class_name : closed_button_class_name
          }
          style={{ marginRight: 5, height: "100%" }}
          onClick={() => {
            this.refs.dropdown_area.focus();
            this.setState({ isOpen: !isOpen });
          }}
          title={button_description}
        >
          {isOpen ? (
            <div className="close-dropdown">
              <span
                aria-label={`${trivial_text_maker("close")} ${
                  _.isObject(dropdown_trigger_txt)
                    ? dropdown_raw_txt
                    : dropdown_trigger_txt
                }`}
                className="close-dropdown__x"
              >
                X
              </span>
              <span className="close-dropdown__x">{dropdown_trigger_txt}</span>
            </div>
          ) : (
            <span
              aria-label={`${trivial_text_maker(
                "open"
              )} ${dropdown_trigger_txt}`}
            >
              {dropdown_trigger_txt}
            </span>
          )}
        </button>
        <div
          tabIndex={0}
          aria-label={
            _.isObject(dropdown_trigger_txt)
              ? dropdown_raw_txt
              : dropdown_trigger_txt
          }
          ref={"dropdown_area"}
          className={classNames(
            dropdown_content_class_name,
            "dropdown__content",
            isOpen && "dropdown__content__is-open"
          )}
        >
          {dropdown_content}
          <button onClick={() => this.setState({ isOpen: !isOpen })}>
            {`${trivial_text_maker("close")} ${
              _.isObject(dropdown_trigger_txt)
                ? dropdown_raw_txt
                : dropdown_trigger_txt
            }`}
          </button>
        </div>
      </div>
    );
  }
}
