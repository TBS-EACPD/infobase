const {
  PanelGraph,
  years : {std_years},
  D3} = require("./shared"); 

new PanelGraph({
  level: 'dept',
  key : "historical_voted_spending",
  depends_on: ['table4'],

  info_deps: [
    'table4_dept_info',
    'table4_gov_info',
  ],

  layout: {
    full: {text: 12, graph:[4,8]},      
    half :{text: 12, graph:[12,12]},     
  },

  title : "dept_historical_voted_spending_title",
  text : "dept_historical_voted_spending_text",

  calculate(subject,info){
    const {table4} = this.tables;
    return { 
      data: table4.q(subject).voted_items(),
      ticks: info.last_years,
    };
  },

  render(panel, calculations, options){
    const { graph_args } = calculations;
    const {ticks , data } = graph_args;

    return D3.create_graph_with_legend.call({panel},{
      get_series_label :  _.property("desc"),
      get_data :  row => _.map(std_years, year =>  row[year+"auth"]),
      data :  _.map(data,function(row){
        row.active = true;
        return row;
      }),
      y_axis : "($)",
      legend_title : "vote",
      ticks,
    });
  },
});


