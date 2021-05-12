import classNames from "classnames";
import _ from "lodash";
import React, { BaseSyntheticEvent } from "react";

import { trivial_text_maker } from "src/models/text";

import "./DropdownMenu.scss";

interface DropdownMenuProps {
  dropdown_content: React.ReactNode;
  opened_button_class_name: string;
  closed_button_class_name: string;
  dropdown_trigger_txt: React.ReactNode | string;
  dropdown_content_class_name?: string;
  button_description?: string;
  dropdown_a11y_txt?: string;
}

type DropdownMenuState = {
  is_open: boolean;
};

export class DropdownMenu extends React.Component<
  DropdownMenuProps,
  DropdownMenuState
> {
  dropdown_ref = React.createRef<HTMLDivElement>();
  toggle_dropdown_button = React.createRef<HTMLDivElement>();
  dropdown_area = React.createRef<HTMLDivElement>();

  constructor(props: DropdownMenuProps) {
    super(props);
    this.state = {
      is_open: false,
    };
  }

  handleWindowClick = (e: MouseEvent) => {
    const { is_open } = this.state;
    const dropdown_node = this.dropdown_ref.current;
    if (is_open && dropdown_node && !dropdown_node.contains(e.target as Node)) {
      this.setState({ is_open: false });
    }
  };

  componentDidMount() {
    window.addEventListener("click", this.handleWindowClick);
  }

  componentDidUpdate(
    prev_props: DropdownMenuProps,
    prev_state: DropdownMenuState
  ) {
    const { is_open } = this.state;
    const dropdown_area_node = this.dropdown_area.current;
    if (is_open && !prev_state.is_open && dropdown_area_node) {
      dropdown_area_node.focus();
    }
  }
  toggle_dropdown = (e: BaseSyntheticEvent) => {
    if (!this.state.is_open) {
      e.stopPropagation();
    }
    this.setState(
      (prev_state) => {
        return { is_open: !prev_state.is_open };
      },
      () => {
        const toggle_dropdown_button_node = this.toggle_dropdown_button.current;
        if (!this.state.is_open && toggle_dropdown_button_node) {
          toggle_dropdown_button_node.focus();
        }
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

    const aria_label = (() => {
      if (dropdown_a11y_txt) {
        return dropdown_a11y_txt;
      } else if (_.isString(dropdown_trigger_txt)) {
        return dropdown_trigger_txt;
      } else {
        return undefined;
      }
    })();

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
          <button className="btn-ib-primary" onClick={this.toggle_dropdown}>
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
