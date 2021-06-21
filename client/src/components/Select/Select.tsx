import _ from "lodash";
import React from "react";

interface OptionsProps {
  id: string | number;
  display: string;
}

interface SelectProps {
  id: string;
  selected: string | number;
  options: OptionsProps[];
  onSelect: (val: string) => void;

  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

//expects options to be of the form [ { id, display } ]
const Select: React.FC<SelectProps> = ({
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
  >
    {_.map(options, (choice) => (
      <option key={choice.id} value={choice.id}>
        {choice.display}
      </option>
    ))}
  </select>
);

export { Select };
