import classNames from "classnames";
import React from "react";

import _ from "lodash";

import { text_maker } from "../tables/table_common";
class DebouncedTextInput extends React.Component {
  render() {
    const {
      a11y_label,
      placeHolder,
      defaultValue,
      debounceTime,
      updateCallback,
      inputClassName,
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
        aria_label={a11y_label || text_maker("text_input")}
        className={classNames("form-control", inputClassName)}
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
