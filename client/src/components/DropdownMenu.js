import classNames from "classnames";
import _ from "lodash";
import React from "react";

import "./DropdownMenu.scss";
import { trivial_text_maker } from "../models/text.js";

export class DropdownMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_open: false,
    };

    this.dropdown_ref = React.createRef();
  }
  handleWindowClick = (e) => {
    const { is_open } = this.state;
    if (is_open && !this.dropdown_ref.current.contains(e.target)) {
      this.setState({ is_open: false });
    }
  };

  componentDidMount() {
    window.addEventListener("click", this.handleWindowClick);
  }

  componentDidUpdate(prev_props, prev_state) {
    const { is_open } = this.state;
    if (is_open && !prev_state.is_open) {
      this.refs.dropdown_area.focus();
    }
  }
  toggle_dropdown = (e) => {
    if (!this.state.is_open) {
      e.stopPropagation();
    }
    this.setState(
      (prev_state) => {
        return { is_open: !prev_state.is_open };
      },
      () => {
        !this.state.is_open && this.refs.toggle_dropdown_button.focus();
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
    const { is_open } = this.state;

    const aria_label = dropdown_a11y_txt
      ? dropdown_a11y_txt
      : _.isString(dropdown_trigger_txt) && dropdown_trigger_txt;

    return (
      <div
        className={classNames("dropdown", is_open && "dropdown--is-open")}
        ref={this.dropdown_ref}
      >
        <button
          aria-haspopup="true"
          aria-expanded={is_open}
          className={
            is_open ? opened_button_class_name : closed_button_class_name
          }
          ref={"toggle_dropdown_button"}
          style={{
            marginRight: 5,
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
          onClick={this.toggle_dropdown}
          title={button_description}
        >
          {dropdown_trigger_txt}
        </button>
        <div
          tabIndex={0}
          aria-label={aria_label}
          ref={"dropdown_area"}
          className={classNames(
            dropdown_content_class_name,
            "dropdown__content"
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
