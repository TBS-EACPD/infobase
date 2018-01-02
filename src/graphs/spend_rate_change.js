const {
  formats,
  run_template,
  PanelGraph,
  D3 : {
    ARROW,
  },
  years: {
    lapse_years: years,
  },
} = require("./shared"); 

const spend_rate_change_render = function(panel, data){
  const {graph_args} = data;

  (new ARROW.arrows(panel.areas().graph.node(),{height : this.height})).render({
    data : graph_args,
    formater : formats.percentage1_raw,
  });

  return {
    alert : false,
    //source : [this.create_links({
    //  cols : ["last_year_spend_rate","this_year_spend_rate"]
    //}) ],
  };


};

new PanelGraph({
  level: "dept",
  key : "spending_rate_change",
  depends_on : ['table101'],
  info_deps: ['table101_gov_info', 'table101_dept_info'],

  layout: {
    full : {text: 6, graph:6},
    half: {text: 12, graph:12},
  },

  height : 300,
  title:   "forecast_spending_rate_title",
  text :  "dept_forecast_spending_rate_text",

  calculate(dept, info){
    return [{
      value: info.dept_spend_rate_change,
      name: run_template(years[0]),
    }];
  },

  render: spend_rate_change_render,
})

new PanelGraph({
  level: "gov",
  key : "spending_rate_change",
  info_deps: ['table101_gov_info'],
  depends_on: ['table101'],

  layout: {
    full : {text: 6, graph:6},
    half: {text: 12, graph:12},
  },

  height : 300,
  title:   "forecast_spending_rate_title",
  text :   "gov_forecast_spending_rate_text",

  calculate(gov, info){
    return [{
      value: info.gov_spend_rate_change, 
      name : run_template(years[0]),
    }];
  },

  render: spend_rate_change_render,
})
