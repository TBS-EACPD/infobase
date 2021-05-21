import _ from "lodash";
import React from "react";

import { CheckBox } from "src/components/index";

import { StaticLegendItemType } from "./LegendItemType";
import "./TabularLegend.scss";

interface TabularLegendProps {
  items: StaticLegendItemType[];
  get_right_content: (item: StaticLegendItemType) => React.ReactNode;
}

export const TabularLegend = ({
  items,
  get_right_content,
}: TabularLegendProps) => (
  <ul className="list-unstyled">
    {_.map(items, (item) => (
      <li key={item.id} className="tabular-legend__list-el">
        <CheckBox
          // using CheckBox without any onClick, and with isSolid makes solid squares with styling otherwise
          // consistent with other legends; a bit of a hack but it's how all the legends get their icon styles ATM
          color={item.color}
          label={item.label}
          isSolidBox={true}
        />
        <span className="tabular-legend__right-column">
          {get_right_content(item)}
        </span>
      </li>
    ))}
  </ul>
);
