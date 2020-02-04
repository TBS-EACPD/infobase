import classNames from 'classnames';
import { LiquidFillGauge as D3LiquidFillGauge } from './liquid_fill_gauge.js';
import { CheckBox } from '../components/index.js';
import { A11YTable } from './A11yTable.js';

const GraphLegend = ({
  isHorizontal, //defaults to false
  isSolidBox, //defaults to false
  items, // [ { active, id, label, color }] 
  onClick, //id => { }
  container_style, //style for div, containing checkbox and label
  checkbox_style, //style for checkbox
  label_style, //style for label
  checkMark_vertical_align, //vertical alignment for checkmark
}) => (
  <ul className={classNames("legend-list-inline", isHorizontal && "horizontal")}>
    {_.map(items, ({ color, label, id, active }) => 
      <li
        key={id}
        className="legend-list-el"
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
          checkMark_vertical_align={checkMark_vertical_align}
        />
      </li>
    )}
  </ul>
);


const TabularPercentLegend = ({
  items, // [ { active, id, label, color }] 
  onClick, //id => { }
  get_right_content, //item => react element
}) => (
  <ul className="list-unstyled">
    {_.map(items, item => 
      <li
        key={item.id}
        className="tabular-legend-list-el"
      >
        <span 
          aria-hidden={true}
          className="legend-color-checkbox"
          style={{backgroundColor: item.color }}
        />
        <span>
          {item.label}
        </span>
        <span style={{marginLeft: 'auto', textAlign: 'right', whiteSpace: "nowrap"}}>
          { get_right_content(item) } 
        </span>
      </li>
    )}
  </ul>
);

class LiquidFillGauge extends React.Component {
  render(){
    return <div ref="graph_area" style={{position: 'relative'}} />;
  }
  _render(){
    this.graph_instance.render(_.clone(this.props));
  }
  componentDidMount(){
    this.graph_instance = new D3LiquidFillGauge(
      this.refs.graph_area,
      _.clone(this.props)
    );
    this._render();

  }
  componentDidUpdate(){
    this._render();
  }
}

export {
  GraphLegend,
  A11YTable,
  TabularPercentLegend,
  LiquidFillGauge,
};