import { Fragment } from 'react';

import { CanadaD3Component } from './CanadaD3Component.js';

import { GraphLegend } from "../declarative_charts.js";
import { NivoResponsiveHBar } from "../NivoCharts.js";
import { hex_to_rgb } from '../../general_utils.js';
import { run_template } from "../../models/text.js";
import { businessConstants } from "../../models/businessConstants.js";
import { trivial_text_maker } from '../../models/text.js';

const { provinces } = businessConstants;

const graph_color = window.infobase_color_constants.secondaryColor;

const get_graph_color = (alpha) => {
  const rgb = hex_to_rgb(graph_color);
  return rgb && `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha || 1})`;
};


class CanadaGraphBarLegend extends React.Component {
  constructor(){
    super();
  }
  render() {
    const {
      prov,
      data,
      years,
      formatter,
    } = this.props;

    const province_graph_title = (prov) => `${trivial_text_maker("five_year_history")} ${prov ? provinces[prov].text : "Canada"}`;

    const graph_data = _.chain(data)
      .map( 
        (data, ix) => ({
          year: run_template(years[ix]), 
          value: prov ? 
            data[prov] :
            _.chain(data)
              .values()
              .sum()
              .value(),
        })
      )
      .reverse()
      .value();

    return (
      <Fragment>
        <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">
          {province_graph_title(prov)}
        </p>
        <div style={{ height: "200px", width: "100%" }}>
          <NivoResponsiveHBar
            data={graph_data}
            indexBy="year"
            keys={["value"]}
            enableLabel={true}
            label_format={d => <tspan x={100} y={16}> {formatter(d)} </tspan>}
            label={d => `${d.data.year}: ${formatter(d.value)}`}
            colorBy={d => get_graph_color(0.5)}
            margin={{
              top: 40,
              right: 30,
              bottom: 20,
              left: 20,
            }}
            padding={0.1}
            is_money={false}
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
    const { graph_args, prov_select_callback } = this.props;
    const { 
      data,
      color_scale,
      years,
      formatter,
    } = graph_args;

    const graph_area_sel = d3.select( ReactDOM.findDOMNode(this.graph_area.current) );

    const ticks = _.map(years, y => `${run_template(y)}`);
    
    const canada_graph = new CanadaD3Component(graph_area_sel.node(), {
      color: get_graph_color(1),
      data,
      ticks,
      color_scale,
      formatter,
    });

    let active_prov = false;
    canada_graph.dispatch.on('dataMouseEnter', prov => {
      active_prov = true;
      prov_select_callback(prov);    
    });
    canada_graph.dispatch.on('dataMouseLeave', () => {
      _.delay(() => {
        if (!active_prov) {
          prov_select_callback(null);
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

    this.prov_select_callback = this.prov_select_callback.bind(this);

    this.state = {
      prov: null,
    };
  }

  prov_select_callback(selected_prov){
    if(selected_prov !== this.state.prov){
      this.setState({prov: selected_prov});
    }
  }

  render(){
    const { graph_args } = this.props;
    const {
      data,
      color_scale,
      years,
      formatter,
    } = graph_args;
    const legend_items = _.reduce(color_scale.ticks(5).reverse(), (result, tick, key) => {
      result.items.push({
        label: result.prevTick ? `${formatter(tick)} - ${formatter(result.prevTick)}` : `${formatter(tick)}+`,
        active: true,
        id: tick,
        color: get_graph_color( color_scale(tick) ),
      });
      result.prevTick = tick;
      return result;
    }, {
      prevTick: null,
      items: [],
    });
  
    return (
      <div className="frow no-container">
        <div className="fcol-md-3">
          <div className="legend-container" style={{ maxHeight: "400px", width: "100%" }}>
            <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">
              {trivial_text_maker("legend")}
            </p>
            <GraphLegend
              items={legend_items.items}
            />
          </div>
          <div className="legend-container" style={{ maxHeight: "400px", width: "100%", overflowY: "hidden", marginTop: "10px"}}>
            <CanadaGraphBarLegend
              prov={this.state.prov}
              data={data}
              years={years}
              formatter={formatter}
            />
          </div>
        </div>
        <div className="fcol-md-9" style={{position: "relative"}}>
          <CanadaGraph
            graph_args={graph_args}
            prov_select_callback={this.prov_select_callback}
          />
        </div>
      </div>
    );
  }
}