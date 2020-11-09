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

    this.dropdown_ref = React.createRef();
  }
  handleWindowClick = (e) => {
    const { isOpen } = this.state;
    if (isOpen && !this.dropdown_ref.current.contains(e.target)) {
      this.setState({ isOpen: false });
    }
  };

  componentDidUpdate() {
    const { isOpen } = this.state;
    if (isOpen) {
      this.refs.dropdown_area.focus();
      window.addEventListener("click", this.handleWindowClick);
    } else {
      window.removeEventListener("click", this.handleWindowClick);
    }
  }
  toggle_dropdown = (e) => {
    if (!this.state.isOpen) {
      e.stopPropagation();
    }
    this.setState(
      (prev_state) => {
        return { isOpen: !prev_state.isOpen };
      },
      () => {
        !this.state.isOpen && this.refs.toggle_dropdown_button.focus();
      }
    );
  };
  render() {
    const {
      dropdown_content,
      opened_button_class_name,
      closed_button_class_name,
      dropdown_content_class_name,
      button_description,
      dropdown_trigger_txt,
      dropdown_a11y_txt, //used if the trigger text is not a string object
    } = this.props;
    const { isOpen } = this.state;

    const aria_label = _.isObject(dropdown_trigger_txt)
      ? dropdown_a11y_txt
      : dropdown_trigger_txt;

    return (
      <div className="dropdown" ref={this.dropdown_ref}>
        <button
          className={
            isOpen ? opened_button_class_name : closed_button_class_name
          }
          ref={"toggle_dropdown_button"}
          style={{ marginRight: 5, height: "100%" }}
          onClick={this.toggle_dropdown}
          title={button_description}
        >
          {isOpen ? (
            <div className="close-dropdown">
              <span
                aria-label={trivial_text_maker("close")}
                className="close-dropdown__x"
              >
                X
              </span>
              <span className="close-dropdown__x" aria-label={aria_label}>
                {dropdown_trigger_txt}
              </span>
            </div>
          ) : (
            <span aria-label={`${trivial_text_maker("open")} ${aria_label}`}>
              {dropdown_trigger_txt}
            </span>
          )}
        </button>
        <div
          tabIndex={0}
          aria-label={aria_label}
          ref={"dropdown_area"}
          className={classNames(
            dropdown_content_class_name,
            "dropdown__content",
            isOpen && "dropdown__content__is-open"
          )}
        >
          {dropdown_content}
          <button onClick={this.toggle_dropdown}>
            {`${trivial_text_maker("close")} ${aria_label}`}
          </button>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.handleWindowClick);
  }
}
