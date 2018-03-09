import "employee_age.ib.yaml";
import {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  years,
  business_constants,
  D3,
  declarative_charts,
  reactAdapter,
} from "../shared";

const { people_years } = years;
const { compact_age_groups } = business_constants;
const { D3GraphWithLegend } = declarative_charts;

const emp_age_render = function(panel,data,options){
  const { graph_args } = data;
  const ticks = _.map(people_years, y => `${run_template(y)}`);
  
  // Options for D3GraphWithLegend React components
  const age_group_options = {
    legend_col_full_size: 4,
    graph_col_full_size: 8,
    graph_col_class: "height-clipped-bar-area",
    ticks: ticks,
    y_axis: text_maker("employees"),
    bar: true,
    stacked: false,
    sort_data: false,
    yaxis_formatter: formats["big_int_real_raw"],
    get_data:  row => row.data, 
    legend_title: "age_group",
    data: graph_args.age_group,
  };
  
  if (!window.is_a11y_mode){
    reactAdapter.render(
      <D3GraphWithLegend panel={panel} options={age_group_options}/>, 
      panel.areas().graph.node() 
    );
  } else {
    D3.create_a11y_table({
      container: panel.areas().text.node(), 
      label_col_header: text_maker("age_group"), 
      data_col_headers: [...ticks, text_maker("five_year_percent_header")], 
      data: _.map(graph_args.age_group, dimension => { 
        return {label: dimension.label, data: [...dimension.data, formats["percentage1_raw"](dimension.five_year_percent)]} 
      }),
    });
  }
};

new PanelGraph({
  level: "dept",
  depends_on: ['table11'],
  key: "employee_age",
  
  info_deps: [
    'table11_dept_info',
    'table11_gov_info',
  ],

  layout: {
    full: {text: 12, graph: 12},
    half: {text: 12, graph: 12},
  },

  text: "dept_employee_age_text_temporary_no_avg_age",
  title: "employee_age_title",

  calculate(dept){
    const {table11} = this.tables;
    const series = table11.q(dept).high_level_rows();
    
    const dept_five_year_total_head_count = _.chain(series)
      .map(row => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    const age_group =  _.chain(series)
      .map(row => {
        const label = _.head(row)
        const data = _.drop(row);
        return {
          label,
          data,
          five_year_percent : d3.sum(data)/dept_five_year_total_head_count,
          active : true,
        };
      })
      .filter(d => d3.sum(d.data) !== 0)
      .value();
    
    return {
      age_group: age_group,
    };
  },

  render: emp_age_render,
});

new PanelGraph({
  level: "gov",
  depends_on: ['table11'],
  info_deps: [
    'table11_gov_info',
  ],
  key: "employee_age",

  layout: {
    full: {text: 12, graph: 12},
    half: {text: 12, graph: 12},
  },

  text: "gov_employee_age_text_temporary_no_avg_age",
  title: "employee_age_title",

  calculate(gov,info){
    const {table11} = this.tables;

    const gov_five_year_total_head_count =_.chain(table11.q().gov_grouping())
      .map(row => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    const age_group = compact_age_groups.map(age_range => {
      const yearly_values = people_years.map( year => table11.horizontal(year,false)[age_range]);
      return {
        label: age_range,
        active: true,
        data: yearly_values,
        five_year_percent: yearly_values.reduce(function(sum, val) { return sum + val }, 0)/gov_five_year_total_head_count,
      };
    })
    
    return {
      age_group: age_group,
    };
  },

  render: emp_age_render,
});

// SWITCH BACK TO THIS CODE ONCE AVG AGE DATA AVAILABLE
//const {Subject,
//  formats,
//  text_maker,
//  run_template,
//  PanelGraph,
//  years : {people_years},
//  business_constants : {
//    compact_age_groups, 
//  },
//  D3,
//  declarative_charts : {
//    D3GraphWithLegend,
//  },
//  TabbedContent,
//  reactAdapter} = require("./shared");
//
//const emp_age_render = function(panel,data,options){
//  const { graph_args } = data;
//  const ticks = _.map(people_years, y => `${run_template(y)}`);
//  
//  // Pre-calculate tighter yTop and yBottom values for line graph, to pass in options
//  const all_avg_ages = _.chain(graph_args.avg_age)
//    .map(d => d.data)
//    .flatten()
//    .value();
//  // Rounded down/up to nearest .5 or .0
//  const avg_age_yBottom = (Math.floor(_.min(all_avg_ages)*2)/2).toFixed(1);
//  const avg_age_yTop = (Math.ceil(_.max(all_avg_ages)*2)/2).toFixed(1);
//  
//  // Options for D3GraphWithLegend React components
//  const age_group_options = {
//    legend_col_full_size : 4,
//    graph_col_full_size : 8,
//    graph_col_class : "height-clipped-bar-area",
//    ticks : ticks,
//    y_axis : text_maker("employees"),
//    bar : true,
//    stacked : false,
//    sort_data : false,
//    yaxis_formatter : formats["big_int_real_raw"],
//    get_data :  row => row.data, 
//    legend_title : "age_group",
//    data : graph_args.age_group,
//  };
//  const avg_age_options = {
//    legend_col_full_size : 4,
//    graph_col_full_size : 8,
//    legend_class : 'fcol-sm-11 fcol-md-11',
//    stacked : false,
//    y_axis : text_maker("avgage"),
//    ticks : ticks,
//    height : this.height,
//    bar : false,
//    yaxis_formatter : formats["int"],
//    legend_title : "legend",
//    get_data :  row =>  row.data,
//    data : graph_args.avg_age,
//    yBottom : avg_age_yBottom, // Pre-calculated lower y-axis value
//    yTop : avg_age_yTop, // Pre-calculated upper y-axis value
//  };
//    
//  if (!window.is_a11y_mode){
//    reactAdapter.render(
//      <TabbedContent
//        tabKeys={["age_group","avgage"]}
//        tabLabels={{
//          age_group : text_maker("age_group"),
//          avgage : text_maker("avgage"),
//        }}
//        tabPaneContents={{
//          age_group: <div 
//            id={"emp_age_tab_pane"}
//            aria-hidden={true}
//          >
//            <D3GraphWithLegend panel={panel} options={age_group_options}/>
//            <div className='clearfix'></div>
//          </div>, 
//          avgage: <div 
//            id={"emp_age_tab_pane"}
//            aria-hidden={true}
//          >
//            <D3GraphWithLegend panel={panel} options={avg_age_options}/>
//            <div className='clearfix'></div>
//          </div>,
//        }}
//      />, 
//      panel.areas().graph.node() 
//    );
//  } else {
//    D3.create_a11y_table({
//      container: panel.areas().text.node(), 
//      label_col_header: text_maker("age_group"), 
//      data_col_headers: [...ticks, text_maker("five_year_percent_header")], 
//      data: _.map(graph_args.age_group, dimension => { 
//        return {label: dimension.label, data: [...dimension.data, formats["percentage1_raw"](dimension.five_year_percent)]} 
//      }),
//    });
//    D3.create_a11y_table({
//      container: panel.areas().text.node(), 
//      label_col_header: text_maker("avgage"), 
//      data_col_headers: ticks, 
//      data: graph_args.avg_age, 
//    });
//  }
//};
//
//new PanelGraph({
//  level: "dept",
//  depends_on : ['table11', 'table304'],
//  key : "employee_age",
//  
//  info_deps: [
//    'table11_dept_info',
//    'table11_gov_info',
//    'table304_dept_info',
//    'table304_gov_info',
//  ],
//
//  layout : {
//    full : {text : 12, graph: 12},
//    half: {text : 12, graph: 12},
//  },
//
//  text: "dept_employee_age_text",
//  title: "employee_age_title",
//
//  calculate(dept){
//    const {table11} = this.tables;
//    const {table304} = this.tables;
//    const series = table11.q(dept).high_level_rows();
//    
//    const avg_age = table304.q(dept).data
//      .map(row => 
//        ({
//          label : Subject.Dept.lookup(row.dept).sexy_name,
//          data : people_years.map(year =>row[year]),
//          active : true,
//        })
//      )
//      .filter(d => d3.sum(d.data) !== 0)
//      .concat({
//        label : text_maker("fps"),
//        data : people_years.map(year => table304.GOC[0][year]),
//        active : true,
//      })
//    
//    const dept_five_year_total_head_count = _.chain(series)
//      .map(row => d3.sum(_.drop(row)))
//      .reduce((sum, val) => sum + val, 0)
//      .value();
//
//    const age_group =  _.chain(series)
//      .map(row => {
//        const label = _.head(row)
//        const data = _.drop(row);
//        return {
//          label,
//          data,
//          five_year_percent : d3.sum(data)/dept_five_year_total_head_count,
//          active : true,
//        };
//      })
//      .filter(d => d3.sum(d.data) !== 0)
//      .value();
//    
//    return {
//      avg_age: avg_age,
//      age_group: age_group,
//    };
//  },
//
//  render: emp_age_render,
//});
//
//new PanelGraph({
//  level: "gov",
//  depends_on : ['table11', 'table304'],
//  info_deps: [
//    'table11_gov_info',
//    'table304_gov_info',
//  ],
//  key : "employee_age",
//
//  layout : {
//    full : {text : 12, graph: 12},
//    half: {text : 12, graph: 12},
//  },
//
//  text: "gov_employee_age_text",
//  title: "employee_age_title",
//
//  calculate(gov,info){
//    const {table11} = this.tables;
//    const {table304} = this.tables;
//    
//    const avg_age = [{
//      label : text_maker("fps"),
//      data : people_years.map(year => table304.GOC[0][year] ),
//      active : true,
//    }];
//    
//    const gov_five_year_total_head_count =_.chain(table11.q().gov_grouping())
//      .map(row => d3.sum(_.drop(row)))
//      .reduce((sum, val) => sum + val, 0)
//      .value()
//
//    const age_group = compact_age_groups.map(age_range => {
//      const yearly_values = people_years.map( year =>  table11.horizontal(year,false)[age_range]);
//      return {
//        label : age_range,
//        active: true,
//        data : yearly_values,
//        five_year_percent : yearly_values.reduce(function(sum, val) { return sum + val;}, 0)/gov_five_year_total_head_count,
//      };
//    })
//    
//    return {
//      avg_age: avg_age,
//      age_group: age_group,
//    };
//  },
//
//  render: emp_age_render,
//});