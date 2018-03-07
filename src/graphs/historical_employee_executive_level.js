const {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  years: {people_years},
  business_constants: {
    ex_levels, 
  },
  D3} = require("./shared"); 

const exec_level_render = function(panel,data){
  const {graph_args} = data;
  
  let ticks =_.map(people_years, y => `${run_template(y)}`);
  let graph_data = graph_args;

  if (window.is_a11y_mode){
    ticks = [...ticks, text_maker("five_year_percent_header")];
    graph_data = _.map(graph_args, dimension => { 
      return {label: dimension.label, data: [...dimension.data, formats["percentage1_raw"](dimension.five_year_percent)]} 
    });
  }

  return D3.create_graph_with_legend.call({panel},{
    legend_class : 'fcol-sm-11 fcol-md-11', 
    y_axis : text_maker("employees"),
    ticks : ticks,
    height : this.height,
    bar : true,
    colors: infobase_colors(),
    yaxis_formatter : formats["big_int_real_raw"],
    legend_title : "ex_level",
    get_data :  function(row){ return row.data; },
    data : graph_data,
    "sort_data" : false,
  }); 

};

new PanelGraph({
  level: "dept",
  depends_on: ['table112'],
  key: "historical_employee_executive_level",

  info_deps: [
    'table112_gov_info',
    'table112_dept_info',
  ],

  layout: {
    full: {text: 12, graph: [4,8]},
    half: {text: 12, graph: [12,12]},
  },

  text :  "dept_historical_employee_executive_level_text",
  title : "historical_employee_executive_level_title",

  calculate(dept, info){
    const {table112} = this.tables;
    return (
      table112.q(dept).data
        .map(row => ({
          label: row.ex_lvl,
          data: people_years.map(year => row[year]),
          five_year_percent: row.five_year_percent,
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
  key: "historical_employee_executive_level",

  info_deps: [
    'table112_gov_info',
  ],

  layout: {
    full: {text: 12, graph: [4,8]},
    half: {text: 12, graph: [12,12]},
  },

  text: "gov_historical_employee_executive_level_text",
  title: "historical_employee_executive_level_title",

  calculate(gov,info){
    const {table112} = this.tables;
    
    const gov_five_year_total_head_count =_.chain(table112.q().gov_grouping())
      .map(row => d4.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.chain(ex_levels)
      .values()
      .map(ex_level => {
        const ex_level_name = ex_level.text;
        const yearly_values = people_years.map(year => table112.horizontal(year,false)[ex_level_name]);
        return {
          label: ex_level_name,
          data: yearly_values,
          five_year_percent : yearly_values.reduce(function(sum, val) { return sum + val;}, 0)/gov_five_year_total_head_count,
          active: (ex_level_name !== "Non-EX"),
        };
      })
      .sortBy(d => d.label)
      .value();
  },

  render: exec_level_render,
});


