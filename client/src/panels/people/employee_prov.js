import text from "./employee_prov.yaml";
import {
  formats,
  run_template,
  PanelGraph,
  years,
  businessConstants,
  charts_index,
  create_text_maker_component,
  StdPanel,
  Col,
  declarative_charts,
  NivoResponsiveHBar,
} from "../shared"; 
import { Fragment } from 'react';

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = years;
const { provinces } = businessConstants;
const { GraphLegend, A11YTable } = declarative_charts;

const graph_color = (alpha) => `rgba(31, 119, 180, ${alpha || 1})`;

const format_prov_data = (prov, years_by_province) => {
  var prov_data;
  if(prov==="Canada"){
    prov_data = _.map(years_by_province,(data,ix) => ({
      year: run_template(people_years[ix]),
      value: _.chain(data)
        .values()
        .sum()
        .value(),
    }));
  } else {
    prov_data = _.map(years_by_province,(data,ix) => ({year: run_template(people_years[ix]), value: data[prov]}));
  }

  return _.reverse(prov_data);
}

class CanadaGraphBarLegend extends React.Component {
  constructor(){
    super();
  }
  render() {
    const { prov, years_by_province } = this.props;

    const province_graph_title = function(prov){
      if (prov === 'on' || prov === 'qc'){
        prov += "lessncr";
      }
      return `${text_maker("five_year_history")} ${prov === "Canada" ? prov : provinces[prov].text}`;
    }

    const formatted_data = format_prov_data(prov,years_by_province);
    const formatter = formats["big_int_real_raw"];
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
            labelSkipWidth={null}
            colorBy ={d => graph_color(0.5)}
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
  componentDidUpdate() {
    this._render();
  }
  _render() {
    const { graph_args, prov_callback } = this.props;
    const { years_by_province, color_scale } = graph_args;

    const graph_area_sel = d3.select( ReactDOM.findDOMNode(this.graph_area.current) );

    const formatter = formats["big_int_real_raw"];
    const ticks = _.map(people_years, y => `${run_template(y)}`);
    
    const canada_graph = new charts_index.Canada(graph_area_sel.node(), {
      color: graph_color(1),
      data: years_by_province,
      ticks: ticks,
      color_scale: color_scale,
      formatter: formatter,
    })

    let active_prov = false;
    canada_graph.dispatch.on('dataMouseEnter', prov => {
      active_prov = true;
      prov_callback(prov);    
    });
    canada_graph.dispatch.on('dataMouseLeave', () => {
      _.delay(() => {
        if (!active_prov) {
          prov_callback("Canada");
        }
      }, 200);
      active_prov = false;
    });

    canada_graph.render();
  }
}

class ProvPanel extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      prov: "Canada",
    }
  }
  render(){
    const {
      calculations,
      footnotes,
      sources,
      level,
    } = this.props.render_args;

    const { info, graph_args } = calculations;
    const { years_by_province, color_scale } = graph_args;

    const prov_callback = (new_prov) => {
      if(new_prov !== this.state.prov){
        this.setState({prov: new_prov});
      }
    }

    const legend_items = _.map( color_scale.ticks(5).reverse(), (tick) => ({
      label: `${formats["big_int_real_raw"](tick)}+`,
      active: true,
      id: tick,
      color: graph_color( color_scale(tick) ),
    }))

    return (
      <StdPanel
        title={text_maker("employee_prov_title")}
        {...{footnotes, sources}}
      >
        <Col size={12} isText>
          <TM k={level+"_employee_prov_text"} args={info} />
        </Col>
        { !window.is_a11y_mode &&
          <Col size={12} isGraph>
            <div className="frow no-container">
              <div className="fcol-md-3">
                <div className="legend-container" style={{ maxHeight: "400px", width: "100%" }}>
                  <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">
                    {text_maker("legend")}
                  </p>
                  <GraphLegend
                    items={legend_items}
                  />
                </div>
                <div className="legend-container" style={{ maxHeight: "400px", width: "100%", overflowY: "hidden", marginTop: "10px"}}>
                  <CanadaGraphBarLegend
                    prov={this.state.prov}
                    years_by_province={graph_args.years_by_province}
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
          </Col>
        }
        { window.is_a11y_mode &&
          <Col size={12} isGraph>
            <A11YTable
              label_col_header = {text_maker("prov")}
              data_col_headers = {[..._.map( people_years, y => run_template(y) ), text_maker("five_year_percent_header")]}
              data = { prepare_data_for_a11y_table(years_by_province) }
            />
          </Col>
        }
      </StdPanel>
    );
  }
};

const prepare_data_for_a11y_table = (years_by_province) => {
  const all_year_headcount_total = _.chain(years_by_province)
    .map( year_by_province => d3.sum( _.values(year_by_province) ) )
    .reduce( (sum, value) => sum + value, 0)
    .value();

  return _.chain(provinces)
    .map( (val, key) => ({ key, label: val.text }) )
    .reject( 
      ({key}) => _.includes(
        [
          'qclessncr',
          'onlessncr',
        ], 
        key
      ) 
    )
    .map( (province) => {
      const yearly_headcounts = _.map(
        years_by_province, 
        (year_by_province) => year_by_province[province.key] 
      );
  
      const five_year_avg_share = d3.sum(yearly_headcounts)/all_year_headcount_total;
      const formated_avg_share = five_year_avg_share > 0 ? 
        formats["percentage1_raw"](five_year_avg_share) :
        undefined;
  
      return {
        label: province.label,
        data: [...yearly_headcounts, formated_avg_share],
      };
    })
    .filter( row => _.some( row.data, data => !_.isUndefined(data) ) )
    .value();
};

const info_deps_by_level = {
  gov: ['orgEmployeeRegion_gov_info'],
  dept: [
    'orgEmployeeRegion_gov_info',
    'orgEmployeeRegion_dept_info',
  ],
};

const calculate_common = (data) => {
  const years_by_province = _.map(
    data,
    year => _.mapKeys(
      year,
      (value, key) => key.replace('lessncr', '')
    )
  );

  const max = d3.max(d3.values(_.last(years_by_province)));
  const color_scale = d3.scaleLinear()
    .domain([0,max])
    .range([0.2,1]);

  return { years_by_province, color_scale };
};
const calculate_funcs_by_level = {
  gov: function(){
    const { orgEmployeeRegion } = this.tables;
    return calculate_common( people_years.map( year => orgEmployeeRegion.prov_code(year, false) ) );
  },
  dept: function(subject){
    const { orgEmployeeRegion } = this.tables;
    return calculate_common( people_years.map( year => orgEmployeeRegion.prov_code(year, subject.unique_id) ) );
  },
};

["gov", "dept"].map(
  level => new PanelGraph({
    key: "employee_prov",
    level: level,
    depends_on: ['orgEmployeeRegion'],
    info_deps: info_deps_by_level[level],
    calculate: calculate_funcs_by_level[level],
    
    render(render_args){
      return <ProvPanel render_args={{...render_args, level}}/>;
    },
  })
);

