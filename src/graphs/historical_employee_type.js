const {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  create_ppl_share_pie,
  create_height_clipped_graph_with_legend,
  years : {people_years},
} = require("./shared"); 

const { tenure } = require('../models/businessConstants');

const employee_type_render = function(panel, data){
  const { graph_args } = data;
  
  if (this.level === "dept"){
    const create_graph_with_legend_options = {
      legend_col_full_size : 4,
      graph_col_full_size : 8,
      graph_col_class : "height-clipped-bar-area",
      legend_class : 'fcol-sm-11 fcol-md-11',
      y_axis : text_maker("employees"),
      ticks : _.map(people_years, y => `${run_template(y)}`),
      height : this.height,
      bar : true,
      yaxis_formatter : formats["big_int_real_raw"],
      legend_title : "employee_type",
      get_data :  _.property("data"),
      data : graph_args,
    };

    // Inserts new row under the text/pie chart row containing bar graph, collapsed by a HeightCliper.
    create_height_clipped_graph_with_legend(panel,create_graph_with_legend_options);
  }

  // Create and render % share pie chart, either to the right of or below panel text
  create_ppl_share_pie({
    pie_area : panel.areas().graph,
    graph_args, 
    label_col_header : text_maker("employee_type"),
  });
};

new PanelGraph({
  level: "dept",
  depends_on : ['table9'],
  key : "historical_employee_type",

  info_deps: [
    'table9_gov_info',
    'table9_dept_info',
  ],

  layout : {
    full : {text : 12, graph: 12},
    half: {text : 12, graph: 12},
  },

  text: "dept_historical_employee_type_text",
  title:"historical_employee_type_title",

  calculate(dept,info){
    const {table9} = this.tables;
    return table9.q(dept).data
      .map(row =>
        ({
          label : row.employee_type,
          data : people_years.map(year =>row[year]),
          five_year_percent : row.five_year_percent,
          active : true,
        })
      )
      .filter(d => d4.sum(d.data) !== 0 );
  },

  render: employee_type_render,
});

new PanelGraph({
  level: "gov",
  depends_on : ['table9'],
  key : "historical_employee_type",

  info_deps: [
    'table9_gov_info',
  ],

  layout : {
    full : {text : 12, graph: 12},
    half: {text : 12, graph: 12},
  },
  
  text: "gov_historical_employee_type_text",
  title:"historical_employee_type_title",

  calculate(gov,info){
    const {table9} = this.tables;				  
    return _.values(tenure)
      .map(tenure_type => {
        const tenure_text = tenure_type.text;
        const yearly_values = people_years.map(year => table9.horizontal(year,false)[tenure_text]);
        return {
          label : tenure_text,
          data :  yearly_values,
          five_year_percent : yearly_values.reduce(function(sum, val) { return sum + val;}, 0)/info.gov_five_year_total_head_count,
          active : true,
        };
      });
  },

  render: employee_type_render,
});

