import classNames from "classnames";
import _ from "lodash";
import type { ChangeEvent } from "react";
import React from "react";

import { trivial_text_maker } from "src/models/text";

const DebouncedTextInputDefaultProps = {
  debounceTime: 500,
  inputClassName: "input-lg",
};
type DebouncedTextInputProps = typeof DebouncedTextInputDefaultProps & {
  a11y_label?: string;
  placeHolder: string;
  defaultValue: string;
  updateCallback: (search_value: string) => void;
  style?: React.CSSProperties;
};

class DebouncedTextInput extends React.Component<DebouncedTextInputProps> {
  render() {
    const {
      a11y_label,
      placeHolder,
      defaultValue,
      debounceTime,
      updateCallback,
      inputClassName,
      style,
    } = this.props;

    this.debounced_callback = _.debounce(
      (event) => updateCallback(event.target.value),
      debounceTime
    );
    const handle_change = (event: ChangeEvent<HTMLInputElement>) => {
      event.persist();
      this.debounced_callback(event);
    };

    const unique_id = _.uniqueId("input-");

    return (
      <input
        id={unique_id}
        type="text"
        aria_label={a11y_label || trivial_text_maker("text_input")}
        className={classNames(inputClassName)}
        style={style}
        placeholder={placeHolder || ""}
        defaultValue={defaultValue || undefined}
        onChange={handle_change}
      />
    );
  }
  componentWillUnmount() {
    !_.isUndefined(this.debounced_callback) && this.debounced_callback.cancel();
  }
}

export { DebouncedTextInput };
