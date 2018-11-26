import accounting from 'accounting';
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
} from "../shared"; 

const { text_maker, TM } = create_text_maker_component(text);

const {people_years} = years;
const {provinces} = businessConstants;

// Old multi-purpose D3 legend code. The ancient prov graph's the only thing using it, so I yanked it from
// common_charts_utils and stuck it here (so that it A: stays deprecated, and B: is for sure cleaned out
// when employee_prov finally gets refactored)
const create_list = function(container, data,options){
  //
  //  `container` is html element
  //  `data` is an array of data objects with no standard
  //  applied as to the attributes, accessor functions are supplied
  //  through the `options` object below, however, if they aren't
  //  supplied, some defaults are provided
  //  options
  //  * `html` is funciton which extacts
  //   the relevant data to be displayed
  //  * `
  //  * `height` is a number
  //  * `legend` is the title
  //  * `ul_classes` : the classes applied to the list el
  //  * `li_classes` : the classes applied to each of the li
  //  * `interactive` - if set to true, will
  //   put all legend text in anchor elements
  //   and dispatch an event when they are clicked
  //  * `align` specifies whether to right or left align
  //     the legend
  //
  //
  options.key = options.key || ( (d,i) => i );
  options.colors = options.colors || ( () => "transparent" );
  options.legend = options.legend || false;
  options.html = options.html || _.identity;
  options.legend_class = options.legend_class || "";
  options.li_classes = options.li_classes || "";
  options.a_class = options.a_class || "";
  options.align = options.align || "center";
  const horizontal = options.orientation === 'horizontal';
  const non_interactive_legend = !options.interactive && options.legend;

  //added extra class to style legends with targetted specificity
  if (options.legend){
    options.legend_class = "legend-container " + (horizontal ? "horizontal " : "") + options.legend_class ;
    options.ul_classes = "legend-list-inline " + options.ul_classes;
    options.li_classes = "legend-list-el " + options.li_classes;
  }

  const dispatch = d3.dispatch("click", "hover");

  container = d3
    .select(container)
    .append("div")
    .attr("aria-hidden", options.legend)
    .classed("d3-list " + options.legend_class, true);

  if (horizontal) {
    options.ul_classes = "horizontal " + options.ul_classes;
  } else {
    container.classed("well", true);
  }
  
  // the height will not always be specified
  if (options.height){
    container.style("max-height", options.height+"px");
  }

  if (options.title && !horizontal) {
    container.append("p")
      .attr("class", "mrgn-bttm-0 mrgn-tp-0 nav-header centerer")
      .html(options.title);
  }

  const list = container
    .append("ul")
    .attr("class", "list-unstyled " + options.ul_classes)
    .style("margin-left", "5px")
    .selectAll("li.d3-list")
    .data(data, options.key);

  list.exit().remove();

  const new_lis = list
    .enter()
    .append("li")
    .attr("class","d3-list " + options.li_classes);

  // if the legend tag is true, then coloured squares  will be 
  // added
  if (options.legend) {
    new_lis
      .append("span")
      .attr("class", "legend-color-checkbox color-tag transparent_div")
      .styles({
        "float": "left",
        "width": "20px",
        "height": "20px",
        "border-radius": "3px",
        "margin-left": "5px",
        "margin-right": "5px",
      })
      .styles({ 
        "border": (d,i) => "1px solid " + options.colors( options.html(d) ),
      })
      .filter( (d) => d.active || non_interactive_legend )
      .styles({ 
        "background-color": (d,i) => options.colors( options.html(d) ),
      });
  }

  new_lis
    .append("div")
    .styles({
      "float": "left",
      "width": () => horizontal ? undefined : "75%",
    })

  list.merge(new_lis);

  // if interactive is true, then each of the items
  // will be placed inside an anchor element
  if (options.interactive){

    // make the coloured square created above clickable 
    new_lis
      .selectAll(".color-tag")
      .style("cursor", "pointer")
      .on( "click", (d,i) => dispatch.call("click", "", d, i, d3.select(this), new_lis) );

    new_lis
      .selectAll('div')
      .append("span")
      .attr("role", "button")
      .attr("tabindex", 0)
      .attr("class", "link-styled " + options.a_class)
      .on( "click", (d,i) => dispatch.call("click", "", d, i, d3.select(this), new_lis) )
      .on( "keydown", (d,i) => {
        if(d3.event.which === 13 || d3.event.which === 32){
          dispatch.call("click", "", d, i, d3.select(this), new_lis);
        }
      })
      .html(options.html);
  }
  
  if (!options.interactive){
    new_lis.selectAll('div').html(options.html);
  }

  new_lis.append("div").attr("class","clearfix");

  // return the dispatcher, the list of li, the first li and the container
  return {
    dispatch,
    new_lis,
    first: d3.select( new_lis.node() ),
    legend: container,
  };
};

const prov_split_render = function(graph_node, graph_args){
  
  const has_qc = _.chain(graph_args.years_by_province)
    .map(d => _.has(d, "qclessncr"))
    .some()
    .value();
  const has_on = _.chain(graph_args.years_by_province)
    .map(d => _.has(d, "onlessncr"))
    .some()
    .value(); 

  // reformat the data for display
  //note: here we deep clone stuff because the graph_args should be immutable, because table dimensions are memoized
  const years_by_province = _.chain(graph_args.years_by_province)
    .map( obj => ({...obj}) ) //deep clone each row  
    .each( year => {
      if (year['qclessncr']) {
        year.qc = year['qclessncr'];
      } else if (has_qc) {
        graph_args.years_by_province
        year.qc = 0;
      }
      if (year['onlessncr']) {
        year.on = year['onlessncr'];
      } else if (has_on) {
        year.on = 0;
      }
      delete year['qclessncr'];
      delete year['onlessncr'];
    })
    .value()


  if(!window.is_a11y_mode){
    const formater = formats["big_int_real_raw"];
    const color_a = a => `rgba(31, 119, 180,${a})`;
  
    let historical_graph_container;
  
    const row = graph_node.append("div").classed("frow no-container",true);
    const legend_area = row.append("div").classed("fcol-md-3 fcol-xs-12",true);
    const graph_area = row.append("div")
      .classed("fcol-md-9 fcol-xs-12",true)
      .style("position","relative");


    // calculate the maximum value to set the darkest shading
    const max = d3.max(d3.values(_.last(years_by_province)));
    // use the max to calibrate the scale

    const color_scale = d3.scaleLinear()
      .domain([0,max])
      .range([0.2,1]);

    // add legend
    var list = create_list(
      legend_area.node(),
      _.map(color_scale.ticks(5).reverse(), tick => 
        ({
          label: tick, 
          active: true,
        })
      ),
      {
        html: d => formater(d.label)+"+",
        legend: true,
        width: "100%",
        title: text_maker("legend"),
        ul_classes: "legend",
        interactive: false,
        colors: label => color_a(color_scale(accounting.unformat(label))),
      }
    );

    const ticks = _.map(people_years, y => `${run_template(y)}`);
    
    const canada_graph = new charts_index.Canada(graph_area.node(), {
      color: "rgb(31, 119, 180)",
      data: years_by_province,
      ticks: ticks,
      color_scale: color_scale,
      formater: formater,
    })

    if ( !window.feature_detection.is_mobile() ) {
      // if it's not mobile, then the graph can go next to the map , under the legend

      historical_graph_container = d3.select(legend_area.node()).append("div");

      // copy the class names and style properties of the legend to ensure the graph fits in nicely
      historical_graph_container.node().className = list.legend.node().className;
      historical_graph_container.node().style.cssText = list.legend.node().style.cssText;
      
      historical_graph_container.styles({ 
        "margin-top": "10px", 
      });

    } else {
      historical_graph_container = d3.select(graph_area.node()).append("div");
    }


    const province_graph_title = function(prov){
      if (prov === 'on' || prov === 'qc'){
        prov += "lessncr";
      }
      if (prov === 'Canada'){
        return text_maker("five_year_history") + " " + prov;
      } else {
        return text_maker("five_year_history") + " " + provinces[prov].text;
      }
    }

    let active_prov;
    const add_graph = function(prov){

      var prov_data;
      var container = historical_graph_container;

      var no_data = false;
      if (prov !== "Canada") {
        prov_data = _.map(years_by_province, prov);
        no_data = _.every(prov_data,_.isUndefined);
      } 
      
      if (prov ==='Canada' || no_data) {
        prov = 'Canada';
        prov_data = _.map(years_by_province,function(year_data){
          return d3.sum(_.values(year_data));
        });
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
        .html(province_graph_title(prov));
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

        container.selectAll("rect").styles({
          "opacity": color_scale(_.last(prov_data)) }); 
        container.selectAll(".x.axis .tick text")
          .styles({ 'font-size': "10px" });
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
    canada_graph.dispatch.on('dataMouseEnter',prov => {
      active_prov = true;
      add_graph(prov);    
    });
    canada_graph.dispatch.on('dataMouseLeave',() => {
      _.delay(() => {
        if (!active_prov) {
          add_graph("Canada");
        }
      }, 200);
      active_prov = false;

    });
    canada_graph.render();
    add_graph("Canada");
    
  }
  

  // Add a11y table  
  if(window.is_a11y_mode){
    const ordered_provs = _.chain(provinces)
      .map( (val,key) => ({ key, display: val.text }) )
      .reject( ({key}) => _.includes([
        'qclessncr',
        'onlessncr',
      ], key ) 
      )
      .value();
    
    const all_year_headcount_total = _.chain(years_by_province)
      .map(year_by_province => d3.sum(_.values(year_by_province)))
      .reduce( (sum, value) => sum +value, 0)
      .value();

    charts_index.create_a11y_table({
      container: graph_node, 
      label_col_header: text_maker("prov"), 
      data_col_headers: [..._.map(people_years, y => `${run_template(y)}`), text_maker("five_year_percent_header")], 
      data: _.chain(ordered_provs)
        .map(function(op){
          const yearly_headcounts = _.map(years_by_province, function(ybp){
            return ybp[op.key];
          });

          const five_year_avg_share = d3.sum(yearly_headcounts)/all_year_headcount_total;
          const formated_avg_share = five_year_avg_share > 0 ? 
            formats["percentage1_raw"](five_year_avg_share) :
            undefined;

          return {
            label: op.display,
            data: [...yearly_headcounts, formated_avg_share],
          };
        })
        .filter(row => _.some(row.data, data => !_.isUndefined(data)))
        .value(), 
      table_name: text_maker("employee_prov_title"),
    });
  }

};

class ProvPanel extends React.Component {
  constructor(){
    super();
    this.graph_col = React.createRef();
  }
  componentDidMount(){
    const { graph_args } = this.props.render_args.calculations;
    const graph_node = d3.select(ReactDOM.findDOMNode(this.graph_col.current));
    prov_split_render(graph_node, graph_args);
  }
  render(){
    const {
      calculations,
      footnotes,
      sources,
      level,
    } = this.props.render_args;

    const { info } = calculations;

    return (
      <StdPanel
        title={text_maker("employee_prov_title")}
        {...{footnotes, sources}}
      >
        <Col size={12} isText>
          <TM k={level+"_employee_prov_text"} args={info} />
        </Col>
        <Col size={12} isGraph passedRef={this.graph_col}/>
      </StdPanel>
    );
  }
}

const info_deps_by_level = {
  gov: ['table10_gov_info'],
  dept: [
    'table10_gov_info',
    'table10_dept_info',
  ],
};

const calculate_funcs_by_level = {
  gov: function(){
    const {table10} = this.tables;
    return {years_by_province: people_years.map( year => table10.prov_code(year,false) )};
  },
  dept: function(subject){
    const {table10} = this.tables;
    return {years_by_province: people_years.map( year => table10.prov_code(year, subject.unique_id) )};
  },
};

["gov", "dept"].map(
  level => new PanelGraph({
    key: "employee_prov",
    level: level,
    depends_on: ['table10'],
    info_deps: info_deps_by_level[level],
    calculate: calculate_funcs_by_level[level],
    
    render(render_args){
      return <ProvPanel render_args={{...render_args, level}}/>;
    },
  })
);

