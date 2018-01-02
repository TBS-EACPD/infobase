const {
  formats,
  PanelGraph,
  years : {planning_years},
  D3} = require("./shared");
  
new PanelGraph({
  level: "dept",
  footnotes : false,
  key : "historical_dept_by_CRSO",
  depends_on: ['table6'],
  info_deps: [
    'table6_dept_info',
  ],
  layout : {
    full : {text : 12, graph: [4,8]},
    half: {text : 12, graph: [12,12]},
  },
  title :"historical_dept_by_CRSO_title",
  text : "historical_dept_by_CRSO_text",
  calculate(subject,info){

    const crsos =   _.chain(subject.crsos)
      .filter('is_cr')
      .reject('dead_so')
      .reject( crso => _.chain(crso.programs)
        .map('dead_program')
        .every()
        .value()
      )
      .value()

    //Excludes dead programs as it is planning data
    const CRSO_data = _.map(crsos, crso => ({
      label: crso.name,
      active: false,
      data:  _.map(planning_years, yr => 
        d4.sum(_.map(this.tables.table6.q(crso).data, prg => prg[yr]))
      ),
    })
    );
    
    if (_.isEmpty(crsos)){
      return false;
    }
    
    return  {crsos, CRSO_data}
  },

  render(panel,calculations){
    const { graph_args, info } = calculations;

    return D3.create_graph_with_legend.call({panel},{
      bar : true,
      get_data :  _.property("data"),
      data :  graph_args.CRSO_data,
      ticks : info.planning_years,
      y_axis : "($)",
      legend_title : "program",
      yaxis_formatter: formats["compact1_raw"],
    });
  },
});



