import _ from "lodash";
import React, { Fragment } from "react";

import { FixedPopover } from "src/components/modals_and_popovers/index";

import { create_text_maker } from "src/models/text";

import { debounced_log_standard_event } from "src/core/analytics";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { IconCopy } from "src/icons/icons";
import { tertiaryColor, textLightColor } from "src/style_constants/index";

import text from "./WriteToClipboard.yaml";

const text_maker = create_text_maker(text);

export class WriteToClipboard extends React.Component {
  constructor() {
    super();

    this.state = {
      copy_status_message: false,
      keyboard_navigation_detected: false,
    };
  }
  render() {
    const {
      text_to_copy,
      button_class_name,
      button_description,
      IconComponent,
      icon_color,
    } = this.props;

    const { copy_status_message, keyboard_navigation_detected } = this.state;

    const modal_active = _.isString(copy_status_message);
    const copy_success = copy_status_message === text_maker("copy_success");
    return (
      <Fragment>
        <button
          className={button_class_name}
          onClick={() => {
            debounced_log_standard_event("WRITE_TO_CLIPBOARD", text_to_copy);
            window.navigator.clipboard
              .writeText(text_to_copy)
              .then(() =>
                this.setState({
                  copy_status_message: text_maker("copy_success"),
                })
              )
              .catch(() =>
                this.setState({ copy_status_message: text_maker("copy_fail") })
              );
          }}
          onKeyDown={() =>
            this.setState({ keyboard_navigation_detected: true })
          }
        >
          <IconComponent
            aria_label={button_description}
            color={icon_color}
            alternate_color={false}
          />
        </button>
        <FixedPopover
          on_close_callback={() =>
            this.setState({ copy_status_message: false })
          }
          show={modal_active}
          title={
            <Fragment>
              <IconCopy
                color={tertiaryColor}
                alternate_color={false}
                aria_hide={true}
              />
              {modal_active
                ? copy_success
                  ? copy_status_message
                  : text_maker("copy_to_clipboard")
                : ""}
            </Fragment>
          }
          subtitle={modal_active && !copy_success && copy_status_message}
          body={
            modal_active &&
            copy_success && (
              /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
              <div tabIndex={0}>{text_to_copy}</div>
            )
          }
          dialog_position="left"
          auto_close_time={
            !is_a11y_mode && modal_active && copy_success && 1900
          }
          close_button_in_header={!is_a11y_mode}
          restore_focus={is_a11y_mode || keyboard_navigation_detected}
        />
      </Fragment>
    );
  }
}
WriteToClipboard.defaultProps = {
  button_description: text_maker("copy_to_clipboard"),
  IconComponent: IconCopy,
  icon_color: textLightColor,
};
