const {
  PanelGraph,
  business_constants  : {
    sos,
  },
  years : {
    std_years,
  },
  D3,
  formats,
} = require("./shared"); 

function spend_by_so_hist_render (panel,calculations){
  const { graph_args } = calculations;
  const {ticks, data} = graph_args;
  const legend_title = "so";

  return D3.create_graph_with_legend.call({panel},{
    get_data: _.property('data'), 
    data,
    ticks,
    y_axis : "$",
    yaxis_formatter: formats.compact1_raw,
    sort_data: false,
    legend_title: legend_title,
  });
};      

_.each(['gov', 'dept'], lvl => {
  new PanelGraph({
    level: lvl,
    key : "spend_by_so_hist",
    depends_on: ['table5'],
    footnotes : [ "SOBJ", "EXP"],

    info_deps: (
      lvl === 'dept' ?  
      [ 'table5_dept_info', 'table5_gov_info' ] : 
      ['table5_gov_info']
    ),

    height : 375,

    layout : {
      full : {text : 12, graph: [4,8]},
      half: {text : 12, graph: [12,12]},
    },

    title : (
      lvl === 'dept' ? 
      "dept_fin_spend_by_so_hist_title"  : 
      "gov_fin_spend_by_so_hist_title"
    ),

    text : (
      lvl === 'dept' ? 
       "dept_fin_spend_by_so_hist_text" :
       "gov_fin_spend_by_so_hist_text"
    ),

    calculate (subject,info){
      const {table5} = this.tables;
      return  {
        data: (
          _.chain(sos)
            .sortBy(sobj => sobj.so_num )
            .map(sobj => 
              ({
                "label": sobj.text,
                "data": std_years.map( year => table5.so_num(year,subject)[sobj.so_num]),
                "active": false,
              })
            )
            .filter(d => d4.sum(d.data) )
            .value()
        ),
        ticks: info.last_years,
      };
    },

    render : spend_by_so_hist_render,
  });
});
