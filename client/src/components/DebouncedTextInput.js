import classNames from "classnames";
import { Fragment } from "react";

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
      <Fragment>
        {a11y_label && (
          <label className="sr-only" htmlFor={unique_id}>
            {a11y_label}
          </label>
        )}
        <input
          id={unique_id}
          type="text"
          className={classNames("form-control", inputClassName)}
          placeholder={placeHolder || ""}
          defaultValue={defaultValue || undefined}
          onChange={handle_change}
        />
      </Fragment>
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
