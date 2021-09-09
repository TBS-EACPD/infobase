import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { text_maker } from "src/tables/table_common";
import "./DebouncedTextInput.scss";

class DebouncedTextInput extends React.Component {
  render() {
    const {
      a11y_label,
      placeHolder,
      defaultValue,
      debounceTime,
      updateCallback,
      inputClassName,
      utility_button,
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
      <div className="input-bar">
        <input
          id={unique_id}
          type="text"
          aria_label={a11y_label || text_maker("text_input")}
          className={classNames(
            "form-control",
            "input-unstyled",
            inputClassName
          )}
          placeholder={placeHolder || ""}
          defaultValue={defaultValue || undefined}
          onChange={handle_change}
        />
        {utility_button}
      </div>
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
