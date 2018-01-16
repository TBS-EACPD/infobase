const {Subject,
  formats,
  text_maker,
  run_template,
  PanelGraph, 
  years : {people_years}, 
  D3} = require("./shared"); 

const average_age_render = function(panel,data){
  const { graph_args } = data;

  return D3.create_graph_with_legend.call({panel},{
    legend_class : 'fcol-sm-11 fcol-md-11',
    stacked : false,
    y_axis : text_maker("avgage"), 
    ticks : _.map(people_years, y => `${run_template(y)}`),
    height : this.height,
    bar : false,
    yaxis_formatter : formats["int"],
    legend_title : "legend",
    get_data :  row =>  row.data,
    data : graph_args,
  });

};

new PanelGraph({
  level: "dept",
  depends_on : ['table304'],

  key : "historical_employee_average_age",

  info_deps: [
    'table304_dept_info',
    'table304_gov_info',
  ],

  layout : {
    full : {text : 12, graph: [4,8]} ,
    half: {text : 12, graph: [12,12]} ,
  },

  text  : "dept_avgage_graph_desc",
  title : "avgage_graph_title",

  calculate(dept, info){
    //TODO: label for dept doesn't display properly in legend, prbably due to change in API
    const {table304} = this.tables;
    return ( 
      table304.q(dept).data
        .map(row => 
          ({
            label : Subject.Dept.lookup(row.dept).sexy_name,
            data : people_years.map(year =>row[year]),
            active : true,
          })
        )
        .filter(d => d4.sum(d.data) !== 0)
        .concat({
          label : text_maker("fps"),
          data : people_years.map(year => table304.GOC[0][year]),
          active : true,
        })
    );
  },

  render: average_age_render,
});

new PanelGraph({
  level: "gov",
  depends_on : ['table304'],
  key : "historical_employee_average_age",

  info_deps: [
    'table304_gov_info',
  ],

  layout : {
    full : {text : 12, graph: [4,8]} ,
    half: {text : 12, graph: [12,12]} ,
  },

  text  : "gov_avgage_graph_desc",
  title : "avgage_graph_title",

  calculate(gov, info){
    const {table304} = this.tables;
    return [
      {
        label : text_maker("fps"),
        data : people_years.map(year => table304.GOC[0][year] ),
        active : true,
      },
    ];
  },

  render: average_age_render,
});


