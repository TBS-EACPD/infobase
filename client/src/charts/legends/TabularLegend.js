import './TabularLegend.scss';

import { CheckBox } from '../../components/index.js';

export const TabularLegend = ({
  items, // [ { active, id, label, color }]
  get_right_content, //item => react element
}) => (
  <ul className="list-unstyled">
    {_.map(items, item => 
      <li
        key={item.id}
        className="tabular-legend__list-el"
      >
        <CheckBox // using without any onClick, just to keep the legends using consistent colour indicator styles
          color={item.color}
          label={item.label}
          isSolidBox={true}
          active={true}
        />
        <span className="tabular-legend__right-column">
          { get_right_content(item) } 
        </span>
      </li>
    )}
  </ul>
);