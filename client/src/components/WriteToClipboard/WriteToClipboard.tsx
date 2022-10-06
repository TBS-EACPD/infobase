import React, { Fragment } from "react";

import { AlertBanner } from "src/components/AlertBanner/AlertBanner";
import { FixedPopover } from "src/components/modals_and_popovers/index";

import { create_text_maker } from "src/models/text";

import { debounced_log_standard_event } from "src/core/analytics";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { IconCopy } from "src/icons/icons";
import { tertiaryColor, textLightColor } from "src/style_constants/index";

import text from "./WriteToClipboard.yaml";

const text_maker = create_text_maker(text);

const WriteToClipboardDefaultProps = {
  button_description: text_maker("copy_to_clipboard"),
  IconComponent: IconCopy,
  icon_color: textLightColor,
};
type WriteToClipboardProps = typeof WriteToClipboardDefaultProps & {
  text_to_copy: string;
  button_class_name: string;
};

interface WriteToClipboardState {
  is_model_open: boolean;
  is_successfully_copied: boolean | null;
  keyboard_navigation_detected: boolean;
}

const default_state = {
  is_model_open: false,
  is_successfully_copied: null,
  keyboard_navigation_detected: false,
};

export class WriteToClipboard extends React.Component<
  WriteToClipboardProps,
  WriteToClipboardState
> {
  static defaultProps = WriteToClipboardDefaultProps;

  constructor(props: WriteToClipboardProps) {
    super(props);

    this.state = default_state;
  }
  render() {
    const {
      text_to_copy,
      button_class_name,
      button_description,
      IconComponent,
      icon_color,
    } = this.props;

    const {
      is_model_open,
      is_successfully_copied,
      keyboard_navigation_detected,
    } = this.state;

    return (
      <Fragment>
        <button
          className={button_class_name}
          onClick={() => {
            debounced_log_standard_event("WRITE_TO_CLIPBOARD", text_to_copy);

            // wraping the API call itself in a promise so that errors where clipboard/writeText itself in undefined are handled by the same copy fail logic
            new Promise((resolve) =>
              resolve(window.navigator.clipboard.writeText(text_to_copy))
            )
              .then(() => {
                this.setState({
                  is_model_open: true,
                  is_successfully_copied: true,
                });
              })
              .catch((e) => {
                debounced_log_standard_event("WRITE_TO_CLIPBOARD_ERROR", e);
                this.setState({
                  is_model_open: true,
                  is_successfully_copied: false,
                });
              });
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
          show={is_model_open}
          on_close_callback={() => this.setState(default_state)}
          title={
            <Fragment>
              <IconCopy
                color={tertiaryColor}
                alternate_color={false}
                aria_hide={true}
              />
              {text_maker("copy_to_clipboard")}
            </Fragment>
          }
          subtitle={
            is_model_open && (
              <AlertBanner
                banner_class={is_successfully_copied ? "success" : "danger"}
                style={{ marginBottom: "0px" }}
              >
                {is_successfully_copied
                  ? text_maker("copy_success")
                  : text_maker("copy_fail")}
              </AlertBanner>
            )
          }
          body={
            is_model_open && (
              <p style={{ whiteSpace: "pre-wrap" }}>{text_to_copy}</p>
            )
          }
          dialog_position="left"
          auto_close_time={!is_a11y_mode && is_successfully_copied && 1900}
          close_button_in_header={!is_a11y_mode}
          restore_focus={is_a11y_mode || keyboard_navigation_detected}
        />
      </Fragment>
    );
  }
}
