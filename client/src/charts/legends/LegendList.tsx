import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { CheckBox, CheckBoxProps } from "src/components/CheckBox/CheckBox";

import { is_a11y_mode } from "src/core/injected_build_constants";

import type { LegendItemType } from "./LegendItemType";

import "./LegendList.scss";

export interface LegendListProps {
  isHorizontal?: boolean;
  items: LegendItemType[];
  onClick: (id: string) => void;
  checkBoxProps?: CheckBoxProps;
}

export const LegendList = ({
  isHorizontal = false,
  items,

  // pass-through props for internal CheckBox component; see CheckBox for options, defaults
  onClick,
  checkBoxProps,
}: LegendListProps) => (
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
          {...checkBoxProps}
          id={id}
          onClick={onClick}
          color={color}
          label={label}
          active={active}
        />
      </li>
    ))}
  </ul>
);
