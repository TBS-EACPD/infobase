import classNames from "classnames";
import React from "react";

import "./RadioButtons.scss";

export const RadioButtons = ({ options, onChange }) => (
  <div className="radio-buttons">
    {options.map(({ display, id, active }) => (
      <button
        key={id}
        aria-pressed={active}
        className={classNames(
          "btn",
          "radio-buttons__option",
          active && "radio-buttons__option--active"
        )}
        onClick={() => {
          onChange(id);
        }}
      >
        {display}
      </button>
    ))}
  </div>
);
