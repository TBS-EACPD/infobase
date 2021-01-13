import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { is_a11y_mode } from "src/app_bootstrap/globals.js";

import { CheckBox } from "../../components/CheckBox.js";

import "./LegendList.scss";

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
      !is_a11y_mode && "legend-list",
      !is_a11y_mode && isHorizontal && "legend-list--horizontal"
    )}
  >
    {_.map(items, ({ color, label, id, active }) => (
      <li key={id} className={is_a11y_mode ? "checkbox" : "legend-list__item"}>
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
