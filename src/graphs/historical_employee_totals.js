const {
  formats,
  text_maker,
  run_template,
  PanelGraph, 
  years : {
    people_years, 
    people_years_short_second,
  },
  D3} = require("./shared"); 

const { months } = require('../models/businessConstants')

const total_hist_employment_calc = function(subject,info){
  const {table9} = this.tables;
  const q = table9.q(subject);
  return { 
    series : { '' : people_years.map(y => q.sum(y) ) },
    ticks: _.map(people_years_short_second, y => `${months[3].text} <br> ${run_template(y)}`),
  };
};
const total_hist_employment_render = function(panel,data){
  const { subject, graph_args } = data;
  const { series, ticks } = graph_args;

  new D3.LINE.ordinal_line( panel.areas().graph.node(), {
    series : series,
    ticks : ticks,
    colors : infobase_colors(),
    add_yaxis : true,
    add_xaxis : true,
    y_axis : text_maker("employees"),
    formater : formats["big_int_real_raw"],
  }).render();

  // Append the a11y table to the text area, as the whole graph area is aria-hidden. This will happen in any case where
  // the graph area is not divided in to multiple areas.
  D3.create_a11y_table({
    container: panel.areas().text, 
    label_col_header : text_maker("org"), 
    data_col_headers: ticks, 
    data : [{label: subject.sexy_name, data: series[""]}],
  });
  
};

new PanelGraph({
  level: "dept",
  depends_on : ['table9'],
  info_deps: [
    'table9_gov_info',
    'table9_dept_info',
  ],
  key : "historical_employee_totals",

  layout : {
    full : {text : 4, graph: 8},
    half : {text : 12, graph: 12},
  },

  text:  "dept_historical_employee_totals_text",
  title: "dept_historical_employee_totals_title",
  calculate : total_hist_employment_calc,
  render: total_hist_employment_render,
});

new PanelGraph({
  level: "gov",
  depends_on : ['table9'],
  key : "historical_employee_totals",
  info_deps: [
    'table9_gov_info',
  ],
  layout : {
    full : {text : 4, graph: 8},
    half : {text : 12, graph: 12},
  },

  text:   "gov_historical_employee_totals_text",
  title:  "gov_historical_employee_totals_title",
  calculate : total_hist_employment_calc,
  render: total_hist_employment_render,
});
