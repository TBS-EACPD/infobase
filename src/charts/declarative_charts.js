import classNames from 'classnames';
import * as charts_index from '../core/charts_index.js';
import { Bar as D3Bar } from './bar.js';
import { Line as D3Line } from './line.js';
import { HBarComposition } from './hbar_composition.js';
import { PieOrBar } from './pie_or_bar.js';
import { SafeProgressDonut } from './safe_progress_donut.js';
import { Pack } from './pack.js';
import { CirclePieChart as D3CirclePieChart } from './circle_chart.js';
import { TwoSeriesBar } from './two_series_bar.js';

import { Fragment } from 'react';

const { create_graph_with_legend, create_a11y_table } = charts_index;

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
  constructor(props){

    super();
    this.state = {
      pagination_index: 0,
      number_of_pages: Math.ceil(props.data.length/props.items_per_page),
    };
  }
  static getDerivedStateFromProps(props, state){
    const derived_number_of_pages = Math.ceil(props.data.length/props.items_per_page);
    
    return {
      pagination_index: (state.pagination_index < derived_number_of_pages) ? state.pagination_index : derived_number_of_pages - 1,
      number_of_pages: derived_number_of_pages,
    };
  }
  render(){
    const { pagination_index } = this.state;
    
    const {
      data,
      items_per_page,
    } = this.props;

    const current_page = pagination_index+1;
    const number_of_pages = Math.ceil(data.length/items_per_page);
    
    const on_first_page = pagination_index === 0;
    const on_last_page = pagination_index === number_of_pages - 1;

    const button_style = {
      width: "10px", 
      margin: "0px 15px",
      textIndent: "-4px",
    };

    return <Fragment>
      <div ref="graph_area" style={{position:'relative'}} />
      { (this.props.paginate && number_of_pages > 1) &&
        <div className="centerer">
          <button
            className="btn btn-ib-primary btn-block"
            style={button_style}
            disabled={on_first_page}
            onClick={ () => this.setState({pagination_index: pagination_index - 1 }) }
            aria-label={ "TODO" }
          >
            ▲
          </button>
          <span> 
            {`${current_page} / ${number_of_pages}`}
          </span>
          <button
            className="btn btn-ib-primary btn-block"
            style={button_style}
            disabled={on_last_page}
            onClick={ () => this.setState({pagination_index: pagination_index + 1 }) }
            aria-label={ "TODO" }
          >
            ▼
          </button>
        </div>
      }
    </Fragment>;
  }
  _render(){
    const {
      data,
      formater,
      colors,
      percentage_mode,
      paginate,
      items_per_page,
    } = this.props;
    
    let prepared_data;

    if (paginate){
      const { pagination_index } = this.state;
      const start_index = pagination_index*items_per_page;
      const end_index = (pagination_index+1)*items_per_page < data.length ?
        (pagination_index+1)*items_per_page :
        data.length;
      
      prepared_data = _.chain(data)
        .sortBy( data => - _.reduce(data.data, (memo, data) => memo + data.data[0], 0) )
        .slice(start_index, end_index)
        .value();
    } else {
      prepared_data = data;
    }

    this.graph_instance.render({
      data: prepared_data,
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
      d3.select(this.refs.graph_area).node(),
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
      this.refs.graph_area,
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
        className="frow" 
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
    if(!window.is_a11y_mode){
      this.graph_instance.render(
        _.chain(this.props.options)
          .extend({graph_area : d3.select(this.refs.graph_area)})
          .clone()
          .value()
      );
    }
    
  }
  componentDidMount(){
    this.graph_instance = create_graph_with_legend.call(
      d3.select(this.refs.graph_area).node(),
      _.chain(this.props.options)
        .extend({graph_area : d3.select(this.refs.graph_area)})
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
    this.graph_instance = new D3Bar(
      d3.select(this.refs.graph_area).node(),
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
    this.graph_instance = new D3Line(
      d3.select(this.refs.graph_area).node(),
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
}) => ( 
  <ul className={classNames("legend-list-inline", isHorizontal && "horizontal")}>
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
        { onClick ?
          <span
            role="button"
            tabIndex={0}
            className="link-styled"
            onClick={()=> onClick(id)}
            onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32) && onClick(id)}
          > 
            { label }
          </span> : 
          <span> { label } </span>
        } 
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
    create_a11y_table({
      container: main,
      ...this.props,
    });
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
    this.graph_instance = new Pack(
      d3.select(this.refs.graph_area),
      _.clone(this.props)
    );
    this._render()

  }
  componentDidUpdate(){
    this._render();
  }
}

class CirclePieChart extends React.Component {
  render(){
    return <div ref="graph_area" style={{position:'relative'}} />
  }
  _render(){
    this.graph_instance.render(_.clone(this.props));
  }
  componentDidMount(){
    this.graph_instance = new D3CirclePieChart(
      this.refs.graph_area,
      _.clone(this.props)
    );
    this._render()

  }
  componentDidUpdate(){
    this._render();
  }
}

class DualAxisBarChart extends React.Component {
  render(){
    return <div ref="graph_area" style={{position:'relative'}} />
  }
  _render(){
    this.graph_instance.render(_.clone(this.props));
  }
  componentDidMount(){

    this.graph_instance = new TwoSeriesBar(
      this.refs.graph_area,
      _.clone(this.props)
    )
    this._render()

  }
  componentDidUpdate(){
    this._render();
  }
}

export {
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
  CirclePieChart,
  DualAxisBarChart,
};
