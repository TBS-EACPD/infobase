import classNames from 'classnames';
import { CheckBox, create_text_maker_component } from '../components/index.js';

const { TM } = create_text_maker_component();

export const GraphLegend = ({
  isHorizontal, //defaults to false
  isSolidBox, //defaults to false
  items, //required: [ {active, id, label, color} ] 
  onClick, //required: id => {}
  container_style, //style for div, containing checkbox and label
  checkbox_style, //style for checkbox
  label_style, //style for label
  checkmark_vertical_align, //defaults to 0.1
  onSelectAll, //function for Select All
  onSelectNone, //function for Select None
}) => (
  <div style={{maxHeight: 'inherit', display: 'flex', flexDirection: 'column'}}>
    <div style={{overflowX: 'hidden'}}>
      <ul className={window.is_a11y_mode ? "list-unstyled" : classNames("legend-list-inline", isHorizontal && "horizontal")}>
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
    </div>
    { onSelectAll && onSelectNone && 
      <div style={{
        borderTop: `1px dashed ${window.infobase_color_constants.tertiaryColor}`,
        padding: "10px 0px 20px 5px",
      }}>
        <TM k="select" />:
        <span onClick={onSelectAll} className="link-styled" style={{margin: "0px 5px 0px 5px"}}>
          <TM k="all"/>
        </span>
        |
        <span onClick={onSelectNone} className="link-styled" style={{marginLeft: "5px"}}>
          <TM k="none"/>
        </span>
      </div>
    }
  </div>
);