const { HBarComposition } = require('./hbar_composition.js');
const { bar } = require('./bar.js'); 
const { PieOrBar } = require('./pie_or_bar.js');
const { ordinal_line } = require('./line.js');
const { create_graph_with_legend, create_a11y_table } = require('../core/D3.js');
const { SafeProgressDonut } = require('./safe_progress_donut.js');
const { pack } = require("./pack");

const classNames = require('classnames');


/* 
  data : [{ 
    label,
    key,
    href,
    data: [{ 
      label,
      data: NUMBER,
        
    }, ... ],
  }, ...],
  formater: to format the NUMBERS
  bar_label_formater: item => string NOT FOR THE NUMBERS
  bar_height: int
  font_size : font-size string (e.g. 12px, 1em, 1rem)
  colors: label => color
  
*/

/* TODO: should we just pass all props to the d3 instance ? */

class StackedHbarChart extends React.Component {
  render(){
    return <div ref="graph_area" style={{position:'relative'}} />
  }
  _render(){
    const {
      data,
      formater,
      colors,
      percentage_mode,
    } = this.props;
  
    this.graph_instance.render({
      data,
      formater,
      colors,
      percentage_mode,
    });
  }
  componentDidMount(){
    let {
      formater,
      font_size,
      bar_height,
      bar_label_formater,
    } = this.props;

    bar_label_formater = bar_label_formater || _.property('label');
    bar_height = bar_height || 50;
    font_size = font_size || "14px";

    //setup
    this.graph_instance = new HBarComposition(
      d4.select(this.refs.graph_area).node(),
      {
        bar_label_formater,
        bar_height,
        font_size,
        formater,
      }
    );
      
    this._render()

  }
  componentDidUpdate(){
    this._render();
  }
}

class ProgressDonut extends React.Component {
  render(){
    return <div ref="graph_area" style={{position:'relative'}} />
  }
  _render(){
    this.graph_instance.render(_.clone(this.props));
  }
  componentDidMount(){
    this.graph_instance = new SafeProgressDonut(
      d4.select(this.refs.graph_area),
      _.clone(this.props)
    );
    this._render()

  }
  componentDidUpdate(){
    this._render();
  }
}

class D3GraphWithLegend extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      legend_col_full_size : props.options.legend_col_full_size, 
      graph_col_full_size : props.options.graph_col_full_size,
      graph_col_class : props.options.graph_col_class,
    };
  }
  render(){
    return (
      <div 
        ref="graph_area"
        className="height-clipped-graph-area frow" 
      >
        <div 
          className={"x1 fcol-xs-12 fcol-md-"+this.state.legend_col_full_size}
          style={{position:"relative"}}
        />
        <div 
          className={"x2 fcol-xs-12 fcol-md-"+this.state.graph_col_full_size+" "+this.state.graph_col_class}
          style={{position:"relative"}}
          tabIndex="-1"
        />
      </div>
    );
  }
  _render(){
    this.graph_instance.render(
      _.chain(this.props.options)
        .extend({graph_area : d4.select(this.refs.graph_area)})
        .clone()
        .value()
    );
  }
  componentDidMount(){
    this.graph_instance = create_graph_with_legend.call(
      d4.select(this.refs.graph_area).node(),
      _.chain(this.props.options)
        .extend({graph_area : d4.select(this.refs.graph_area)})
        .clone()
        .value()
    );
    this._render()

  }
  componentDidUpdate(){
    this._render();
  }
}

class Bar extends React.Component {
  render(){
    return <div ref="graph_area" style={{position:'relative'}} />
  }
  _render(){
    this.graph_instance.render(_.clone(this.props));
  }
  componentDidMount(){
    this.graph_instance = new bar(
      d4.select(this.refs.graph_area).node(),
      _.clone(this.props)
    );
    this._render()

  }
  componentDidUpdate(){
    this._render();
  }
}

class SafePie extends React.Component {
  render(){
    return <div ref="graph_area" style={{position:'relative'}} />
  }
  _render(){
    this.graph_instance.render(_.clone(this.props));
  }
  componentDidMount(){
    this.graph_instance = new PieOrBar( 
      this.refs.graph_area,
      _.clone(this.props)
    );
    this._render()

  }
  componentDidUpdate(){
    this._render();
  }
}

class Line extends React.Component {
  render(){
    return <div ref="graph_area" style={{position:'relative'}} />
  }
  _render(){
    this.graph_instance.render(_.clone(this.props));
  }
  componentDidMount(){
    this.graph_instance = new ordinal_line(
      d4.select(this.refs.graph_area).node(),
      _.clone(this.props)
    );
    this._render()

  }
  componentDidUpdate(){
    this._render();
  }
}

const GraphLegend = ({ 
  isHorizontal,  //defaults to false
  items, // [ { active, id, label, color }] 
  onClick,  //id => { }
  active,
}) => ( 
  <ul className={classNames("list-unstyled legend-list-inline", isHorizontal && "horizontal")}>
    {_.map(items, ({ color, label, id, active }) => 
      <li
        key={id}
        role={ onClick ? "checkbox" : null}
        aria-checked={onClick ? active : null}
        className="legend-list-el"
      >
        <span 
          aria-hidden={true}
          style={ 
            (!onClick || active) ?  
            { backgroundColor: color, border: "1px solid " + color } : 
            { border: "1px solid " + color }
          }
          className="legend-color-checkbox"
        />
        {React.createElement(  //only make it a link if clicking it does something
          onClick ? 'a' : 'span',
          { 
            href: onClick ? "#" : null,
            onClick: onClick ? ()=> { onClick(id) } : null,
            role: onClick ? "button" : null, 
          },
          label
        )} 
      </li>
    )}
  </ul>
);


const TabularPercentLegend = ({
  items, // [ { active, id, label, color }] 
  onClick,  //id => { }
  get_right_content, //item => react element
}) => (
  <ul className="list-unstyled">
    {_.map(items, item  => 
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
        <span style={{marginLeft:'auto', textAlign: 'right', whiteSpace: "nowrap"}}>
          { get_right_content(item) } 
        </span>
      </li>
    )}
  </ul>
);


class A11YTable extends React.PureComponent {
  render(){
    return <div ref="main" />
  }
  componentDidMount(){
    this._render();
  }
  componentDidUpdate(){
    this._render();
  }
  _render(){
    const { main } = this.refs;
    main.innerHTML = "";
    create_a11y_table(Object.assign(
      { container: main },
      this.props
    ));
  }

}

class CirclePack extends React.Component {
  render(){
    return <div ref="graph_area" style={{position:'relative'}} />
  }
  _render(){
    this.graph_instance.render(_.clone(this.props));
  }
  componentDidMount(){
    this.graph_instance = new pack(
      d4.select(this.refs.graph_area),
      _.clone(this.props)
    );
    this._render()

  }
  componentDidUpdate(){
    this._render();
  }
}

module.exports = exports = {
  StackedHbarChart,
  GraphLegend,
  D3GraphWithLegend,
  Bar,
  Line,
  A11YTable,
  TabularPercentLegend,
  SafePie,
  ProgressDonut,
  CirclePack, 
};
