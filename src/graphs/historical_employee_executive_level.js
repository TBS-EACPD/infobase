const {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  years : {people_years},
  business_constants : {
    ex_level_map, 
  },
  D3} = require("./shared"); 

const exec_level_render = function(panel,data){
  const {graph_args} = data;

  return D3.create_graph_with_legend.call({panel},{
    legend_class : 'col-sm-12 col-md-8 col-md-offset-1', 
    y_axis : text_maker("employees"),
    ticks : _.map(people_years, y => `${run_template(y)}`),
    height : this.height,
    bar : true,
    colors: infobase_colors(),
    yaxis_formatter : formats["big_int_real_raw"],
    legend_title : "ex_level",
    get_data :  function(row){ return row.data; },
    data : graph_args,
    "sort_data" : false,
  }); 

};

new PanelGraph({
  level: "dept",
  depends_on: ['table112'],
  key : "historical_employee_executive_level",

  info_deps: [
    'table112_gov_info',
    'table112_dept_info',
  ],

  layout : {
    full : {text : 12, graph: [4,8]},
    half: {text : 12, graph: [12,12]},
  },

  text :  "dept_historical_employee_executive_level_text",
  title : "historical_employee_executive_level_title",

  calculate(dept, info){
    const {table112} = this.tables;
    return (
      table112.q(dept).data
        .map(row => ({
          label : row.ex_lvl,
          data : people_years.map(year => row[year]),
          active: (row.ex_lvl !== "Non-EX"),
        })
        )
        .filter(d => d4.sum(d.data) !== 0)
    );
  },

  render: exec_level_render,
});

new PanelGraph({
  level: "gov",
  depends_on: ['table112'],
  key : "historical_employee_executive_level",

  info_deps: [
    'table112_gov_info',
  ],

  layout : {
    full : {text : 12, graph: [4,8]},
    half: {text : 12, graph: [12,12]},
  },

  text :  "gov_historical_employee_executive_level_text",
  title : "historical_employee_executive_level_title",

  calculate(gov,info){
    const {table112} = this.tables;
    
    return ( 
      _.chain(ex_level_map)
        .keys()
        .map(exec_level => {
          return {
            label : exec_level,
            data :  people_years.map(year => table112.horizontal(year,false)[exec_level]),
            active: (exec_level !== "Non-EX"),
          };
        }
        )
        .sortBy(d => d.label)
        .value()
    )
  },

  render: exec_level_render,
});


