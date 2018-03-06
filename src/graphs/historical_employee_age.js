const {formats,
  text_maker,
  run_template,
  PanelGraph,
  years : {people_years},
  business_constants : {
    compact_age_groups, 
  },
  D3,
  declarative_charts : {
    D3GraphWithLegend,
  },
  reactAdapter} = require("./shared");
 
const emp_age_render = function(panel,data,options){
  const { graph_args } = data;
  const ticks = _.map(people_years, y => `${run_template(y)}`);
  
  // Options for D3GraphWithLegend React components
  const age_group_options = {
    legend_col_full_size : 4,
    graph_col_full_size : 8,
    graph_col_class : "height-clipped-bar-area",
    ticks : ticks,
    y_axis : text_maker("employees"),
    bar : true,
    stacked : false,
    sort_data : false,
    yaxis_formatter : formats["big_int_real_raw"],
    get_data :  row => row.data, 
    legend_title : "age_group",
    data : graph_args.age_group,
    no_a11y : true,
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
      data_col_headers: ticks, 
      data: graph_args.age_group, 
      table_name: text_maker("a11y_table_title_default"),
    });
  }
};

new PanelGraph({
  level: "dept",
  depends_on : ['table11'],
  key : "historical_employee_age",
  
  info_deps: [
    'table11_dept_info',
    'table11_gov_info',
  ],

  layout : {
    full : {text : 12, graph: 12},
    half: {text : 12, graph: 12},
  },

  text: "dept_historical_employee_age_text_temporary_no_avg_age",
  title: "historical_employee_age_title",

  calculate(dept){
    const {table11} = this.tables;
    const series = table11.q(dept).high_level_rows();
    
    const age_group =  _.chain(compact_age_groups)
      .map(age_group => {
        const data = _.chain(series)
          .find(row => 
            row[0] === age_group
          )
          .tail()   
          .value();
        return {
          label : age_group,
          data : data,
          active : true,
        };
      })
      .filter(d => d4.sum(d.data) !== 0)
      .value()
    
    return {
      age_group: age_group,
    };
  },

  render: emp_age_render,
});

new PanelGraph({
  level: "gov",
  depends_on : ['table11'],
  info_deps: [
    'table11_gov_info',
  ],
  key : "historical_employee_age",

  layout : {
    full : {text : 12, graph: 12},
    half: {text : 12, graph: 12},
  },

  text: "gov_historical_employee_age_text_temporary_no_avg_age",
  title: "historical_employee_age_title",

  calculate(gov,info){
    const {table11} = this.tables;
    
    const age_group = compact_age_groups.map(age_range => {
      return {
        label : age_range,
        active: true,
        data : people_years.map( year =>  table11.horizontal(year,false)[age_range]),
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
//    no_a11y : true,
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
//    no_a11y : true,
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
//      data_col_headers: ticks, 
//      data: graph_args.age_group, 
//      table_name: text_maker("a11y_table_title_default"),
//    });
//    D3.create_a11y_table({
//      container: panel.areas().text.node(), 
//      label_col_header: text_maker("avgage"), 
//      data_col_headers: ticks, 
//      data: graph_args.avg_age, 
//      table_name: text_maker("a11y_table_title_default"),
//    });
//  }
//};
//
//new PanelGraph({
//  level: "dept",
//  depends_on : ['table11', 'table304'],
//  key : "historical_employee_age",
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
//  text: "dept_historical_employee_age_text",
//  title: "historical_employee_age_title",
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
//      .filter(d => d4.sum(d.data) !== 0)
//      .concat({
//        label : text_maker("fps"),
//        data : people_years.map(year => table304.GOC[0][year]),
//        active : true,
//      })
//    
//    const age_group =  _.chain(compact_age_groups)
//      .map(age_group => {
//        const data = _.chain(series)
//          .find(row => 
//            row[0] === age_group
//          )
//          .tail()   
//          .value();
//        return {
//          label : age_group,
//          data : data,
//          active : true,
//        };
//      })
//      .filter(d => d4.sum(d.data) !== 0)
//      .value()
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
//  key : "historical_employee_age",
//
//  layout : {
//    full : {text : 12, graph: 12},
//    half: {text : 12, graph: 12},
//  },
//
//  text: "gov_historical_employee_age_text",
//  title: "historical_employee_age_title",
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
//    const age_group = compact_age_groups.map(age_range => {
//      return {
//        label : age_range,
//        active: true,
//        data : people_years.map( year =>  table11.horizontal(year,false)[age_range]),
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