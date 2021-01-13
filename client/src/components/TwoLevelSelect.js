import _ from "lodash";
import React from "react";


/*same as above Select component, but expects groups to be of the form	
  [ { id: group1, display: "Group 1", children : [ { id, display } , ... ] }, ... ]	
*/

const TwoLevelSelect = ({
  style,
  id,
  selected,
  className,
  grouped_options,
  onSelect,
  disabled,
}) => (
  <select
    id={id}
    style={style}
    disabled={disabled}
    className={className}
    value={selected}
    onChange={(event) => onSelect(event.target.value)}
  >
    {_.map(grouped_options, ({ children, display, id }) => (
      <optgroup key={id} label={display}>
        {_.map(children, (choice) => (
          <option key={choice.id} value={choice.id}>
            {choice.display}
          </option>
        ))}
      </optgroup>
    ))}
  </select>
);

export { TwoLevelSelect };
