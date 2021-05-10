import _ from "lodash";
import React from "react";

import { CheckBox } from "src/components/index";
import "./TabularLegend.scss";

export const TabularLegend = ({
  items, // [ { id, label, color }]
  get_right_content, //item => react element
}) => (
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
