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
} from "../shared"; 

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = years;
const { provinces } = businessConstants;
const { GraphLegend, A11YTable } = declarative_charts;

const graph_color = (alpha) => `rgba(31, 119, 180, ${alpha || 1})`;


const prov_split_render = function(legend_area, graph_area, graph_args){

  const { years_by_province, color_scale } = graph_args;

  const formater = formats["big_int_real_raw"];

  const ticks = _.map(people_years, y => `${run_template(y)}`);
  
  const canada_graph = new charts_index.Canada(graph_area.node(), {
    color: graph_color(1),
    data: years_by_province,
    ticks: ticks,
    color_scale: color_scale,
    formater: formater,
  })

  const historical_graph_container = d3.select( legend_area.node() ).append("div");
  if ( !window.feature_detection.is_mobile() ){
    // if it's not mobile, then the graph can go next to the map , under the legend

    // copy the class names and style properties of the legend to ensure the graph fits in nicely
    const legend_container = legend_area.select(".legend-container");
    historical_graph_container.node().className = legend_container.node().className;
    historical_graph_container.node().style.cssText = legend_container.node().style.cssText;
    
    historical_graph_container.styles({ "margin-top": "10px" });
  }

  const province_graph_title = function(prov){
    if (prov === 'on' || prov === 'qc'){
      prov += "lessncr";
    }
    return `${text_maker("five_year_history")} ${prov === "Canada" ? prov : provinces[prov].text}`;
  }

  let active_prov;
  const add_graph = function(prov){

    var prov_data;
    var container = historical_graph_container;

    var no_data = false;
    if (prov !== "Canada") {
      prov_data = _.map(years_by_province, prov);
      no_data = _.every(prov_data, _.isUndefined);
    } else 
    
    if (prov === 'Canada' || no_data) {
      prov = 'Canada';
      prov_data = _.map(years_by_province, (year_data) => d3.sum( _.values(year_data) ) );
    }

    if (container.datum() === prov){
      return;
    } else {
      container.datum(prov);
    }
    //empty out the group
    container.selectAll("*").remove();
    // add title
    container.append("p")
      .classed("mrgn-bttm-0 mrgn-tp-0 centerer", true)
      .html( province_graph_title(prov) );
    // add in the require div with relative positioning so the
    // labels will line up with the graphics
    container.append("div")
      .styles({ 
        "margin-bottom": "10px",
        position: "relative",
      });

    if( window.feature_detection.is_mobile() ){ // create a bar graph
      (new charts_index.Bar(
        container.select("div").node(),
        {
          colors: ()=>"#1f77b4",
          formater: formater,
          series: {"": prov_data},
          height: 200,
          ticks: ticks,
          margins: {top: 10, bottom: 10, left: 10, right: 10},
        }
      )).render();

      container.selectAll("rect").styles({ "opacity": color_scale(_.last(prov_data)) }); 
      container.selectAll(".x.axis .tick text").styles({ 'font-size': "10px" });
    } else { //use hbar
      (new charts_index.HBar(
        container.select("div").node(),
        {
          x_scale: d3.scaleLinear(),
          axisFormater: formater,
          formater: formater,
          tick_number: 5,
          data: ticks.map((tick,i) => ({value: prov_data[i], name: tick}) ),
        }
      )).render();
    }
  };

  canada_graph.dispatch.on('dataMouseEnter', prov => {
    active_prov = true;
    add_graph(prov);    
  });
  canada_graph.dispatch.on('dataMouseLeave', () => {
    _.delay(() => {
      if (!active_prov) {
        add_graph("Canada");
      }
    }, 200);
    active_prov = false;
  });

  canada_graph.render();
  add_graph("Canada");
};


class ProvPanel extends React.Component {
  constructor(){
    super();
    this.legend_area = React.createRef();
    this.graph_area = React.createRef();
  }
  componentDidMount(){
    if (!window.is_a11y_mode){
      const { graph_args } = this.props.render_args.calculations;
      const legend_area = d3.select( ReactDOM.findDOMNode(this.legend_area.current) );
      const graph_area = d3.select( ReactDOM.findDOMNode(this.graph_area.current) );
      prov_split_render(legend_area, graph_area, graph_args);
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
              <div className="fcol-md-3 fcol-xs-12" ref={this.legend_area}>
                <div
                  className="legend-container"
                  style={{ maxHeight: "400px", width: "100%" }}
                >
                  <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">
                    {text_maker("legend")}
                  </p>
                  <GraphLegend
                    items={
                      _.map( 
                        color_scale.ticks(5).reverse(),
                        (tick) => ({
                          label: `${formats["big_int_real_raw"](tick)}+`,
                          active: true,
                          id: tick,
                          color: graph_color( color_scale(tick) ),
                        })
                      )
                    }
                  />
                </div>
              </div>
              <div className="fcol-md-9 fcol-xs-12" style={{position: "relative"}} ref={this.graph_area}/>
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

