import "./LegendList.scss";

import classNames from "classnames";
import { CheckBox } from "../../components/index.js";

export const LegendList = ({
  isHorizontal = false,
  items, //required: [ {active, id, label, color} ]

  // pass-through props for internal CheckBox component; see CheckBox for options, defaults
  onClick,
  LegendCheckBoxProps,
}) => (
  <ul
    className={classNames(
      "list-unstyled",
      !window.is_a11y_mode && "legend-list",
      !window.is_a11y_mode && isHorizontal && "legend-list--horizontal"
    )}
  >
    {_.map(items, ({ color, label, id, active }) => (
      <li
        key={id}
        className={window.is_a11y_mode ? "checkbox" : "legend-list__item"}
      >
        <CheckBox
          onClick={onClick}
          {...LegendCheckBoxProps}
          id={id}
          color={color}
          label={label}
          active={active}
        />
      </li>
    ))}
  </ul>
);
