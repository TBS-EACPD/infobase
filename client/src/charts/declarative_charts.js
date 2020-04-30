import classNames from 'classnames';
import { CheckBox, create_text_maker_component } from '../components/index.js';
import { A11YTable } from './A11yTable.js';

const { text_maker } = create_text_maker_component();

const GraphLegend = ({
  isHorizontal, //defaults to false
  isSolidBox, //defaults to false
  items, //required: [ {active, id, label, color} ] 
  onClick, //required: id => {}
  container_style, //style for div, containing checkbox and label
  checkbox_style, //style for checkbox
  label_style, //style for label
  checkmark_vertical_align, //defaults to 0.1
  onToggleClick, //Toggles all items
  toggleActive, //Toggle active status
}) => (
  <ul className={window.is_a11y_mode ? "list-unstyled" : classNames("legend-list-inline", isHorizontal && "horizontal")}>
    { onToggleClick && 
      <CheckBox
        id="toggleAll"
        label={text_maker("select_all")}
        onClick={onToggleClick}
        active={toggleActive}
        container_style={{
          borderBottom: `1px dashed ${window.infobase_color_constants.tertiaryColor}`,
          paddingBottom: 10,
          marginBottom: 10,
        }}
      />
    }
    {_.map(items, ({ color, label, id, active }) => 
      <li
        key={id}
        className= {window.is_a11y_mode ? "checkbox" : "legend-list-el"}
      >
        <CheckBox
          id={id}
          onClick={onClick}
          color={color}
          label={label}
          active={active}
          isSolidBox={isSolidBox}
          container_style={container_style}
          checkbox_style={checkbox_style}
          label_style={label_style}
          checkmark_vertical_align={checkmark_vertical_align}
        />
      </li>
    )}
  </ul>
);



export {
  GraphLegend,
  A11YTable,
};