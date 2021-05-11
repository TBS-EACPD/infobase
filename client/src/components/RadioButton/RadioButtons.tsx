import classNames from "classnames";
import React from "react";

import "./RadioButtons.scss";

interface OptionsProps {
  display: string | React.ReactNode;
  id: string;
  active: boolean;
}

interface RadioButtonsProps {
  options: OptionsProps[];
  onChange: (id: string) => void;
}

export const RadioButtons: React.FC<RadioButtonsProps> = ({
  options,
  onChange,
}) => (
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
