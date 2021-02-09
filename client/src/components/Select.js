import _ from "lodash";
import React from "react";

//expects options to be of the form [ { id, display } ]
const Select = ({
  id,
  selected,
  className,
  options,
  onSelect,
  disabled,
  style,
  title,
}) => (
  <select
    style={style}
    id={id}
    disabled={disabled}
    className={className}
    value={selected}
    onChange={(event) => onSelect(event.target.value)}
    title={title}
    aria-label={title}
  >
    {_.map(options, (choice) => (
      <option key={choice.id} value={choice.id}>
        {choice.display}
      </option>
    ))}
  </select>
);

export { Select };
