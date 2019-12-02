
import {
  formats,
  run_template,
  businessConstants,
  declarative_charts,
  NivoResponsiveHBar,
} from "../../panels/shared.js";
import { Canada_D3_Component } from './canada_d3_component.js';
import { hex_to_rgb } from '../../general_utils.js';
import { Fragment } from 'react';
import { trivial_text_maker } from '../../models/text.js';

const { GraphLegend } = declarative_charts;
const { provinces } = businessConstants;

const graph_color = window.infobase_color_constants.secondaryColor;

const get_graph_color = (alpha) => {
  const rgb = hex_to_rgb(graph_color);
  return rgb && `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha || 1})`;
};

const format_prov_data = (prov, years_by_province, context_years) => {
  const prov_data = prov ?
    _.map(years_by_province,(data,ix) => ({year: run_template(context_years[ix]), value: data[prov]}))
    : _.map(years_by_province,(data,ix) => ({
      year: run_template(context_years[ix]),
      value: _.chain(data)
        .values()
        .sum()
        .value(),
    }));
  return _.reverse(prov_data);
};

class CanadaGraphBarLegend extends React.Component {
  constructor(){
    super();
  }
  render() {
    const {
      prov,
      years_by_province,
      context_years,
      formatter,
      includeNcr,
    } = this.props;

    const province_graph_title = function(prov){
      if (includeNcr && (prov === 'on' || prov === 'qc')){
        prov += "lessncr";
      }
      return `${trivial_text_maker("five_year_history")} ${prov ? provinces[prov].text : prov}`;
    };

    const formatted_data = format_prov_data(prov, years_by_province, context_years);
    return (
      <Fragment>
        <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">
          {province_graph_title(prov)}
        </p>
        <div style={{ height: "200px", width: "100%" }}>
          <NivoResponsiveHBar
            data = {formatted_data}
            indexBy = "year"
            keys = {["value"]}
            enableLabel = {true}
            label_format = { d=><tspan x={100} y={16}> {formatter(d)} </tspan>}
            label={d => `${d.data.year}: ${formatter(d.value)}`}
            colorBy ={d => get_graph_color(0.5)}
            margin = {{
              top: 40,
              right: 30,
              bottom: 20,
              left: 20,
            }}
            padding = {0.1}
            is_money = {false}
            top_axis={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -30,
              tickValues: 4,
              format: (d) => formatter(d),
            }}
            remove_bottom_axis={true}
            remove_left_axis={true}
            add_top_axis={true}
            enableGridX={false}
            enableGridY={false}
            isInteractive={false}
          />
        </div>
      </Fragment>
    );
  }
}

class CanadaGraph extends React.Component {
  constructor(){
    super();
    this.graph_area = React.createRef();
  }
  render() {
    return <div ref={this.graph_area}/>;
  }
  componentDidMount() {
    this._render();
  }
  _render() {
    const { graph_args, prov_callback } = this.props;
    const { 
      years_by_province,
      color_scale,
      context_years,
      formatter,
      includeNcr,
    } = graph_args;

    const graph_area_sel = d3.select( ReactDOM.findDOMNode(this.graph_area.current) );

    const ticks = _.map(context_years, y => `${run_template(y)}`);
    
    const canada_graph = new Canada_D3_Component(graph_area_sel.node(), {
      color: get_graph_color(1),
      data: years_by_province,
      ticks: ticks,
      color_scale: color_scale,
      formatter: formatter,
      includeNcr: includeNcr,
    });

    let active_prov = false;
    canada_graph.dispatch.on('dataMouseEnter', prov => {
      active_prov = true;
      prov_callback(prov);    
    });
    canada_graph.dispatch.on('dataMouseLeave', () => {
      _.delay(() => {
        if (!active_prov) {
          prov_callback(null);
        }
      }, 200);
      active_prov = false;
    });

    canada_graph.render();
  }
}

export class Canada extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      prov: null,
    };
  }

  render(){
    const { graph_args } = this.props;
    const {
      years_by_province,
      color_scale,
      context_years,
      formatter,
      includeNcr,
    } = graph_args;

    const legend_items = _.map( color_scale.ticks(5).reverse(), (tick) => ({
      label: `${formats["compact_raw"](tick)}+`,
      active: true,
      id: tick,
      color: get_graph_color( color_scale(tick) ),
    }));

    const prov_callback = (new_prov) => {
      if(new_prov !== this.state.prov){
        this.setState({prov: new_prov});
      }
    };
  
    return (
      <div className="frow no-container">
        <div className="fcol-md-3">
          <div className="legend-container" style={{ maxHeight: "400px", width: "100%" }}>
            <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">
              {trivial_text_maker("legend")}
            </p>
            <GraphLegend
              items={legend_items}
            />
          </div>
          <div className="legend-container" style={{ maxHeight: "400px", width: "100%", overflowY: "hidden", marginTop: "10px"}}>
            <CanadaGraphBarLegend
              prov={this.state.prov}
              years_by_province={years_by_province}
              context_years={context_years}
              formatter={formatter}
              includeNcr={includeNcr}
            />
          </div>
        </div>
        <div className="fcol-md-9" style={{position: "relative"}}>
          <CanadaGraph
            graph_args={graph_args}
            prov_callback={prov_callback}
          />
        </div>
      </div>
    );
  }
}