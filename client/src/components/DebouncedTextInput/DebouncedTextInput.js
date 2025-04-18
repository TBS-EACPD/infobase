import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { trivial_text_maker } from "src/models/text";

class DebouncedTextInput extends React.Component {
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
    const handle_change = (event) => {
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

DebouncedTextInput.defaultProps = {
  debounceTime: 500,
  inputClassName: "input-lg",
};

export { DebouncedTextInput };
