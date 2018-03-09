const {
  PanelGraph,
  years : {planning_years},
  D3} = require("./shared"); 

new PanelGraph({
  level: "crso",
  footnotes : ["PLANNED_EXP"],
  key : "planned_program_spending",
  depends_on: ['table6'],
  info_deps: [
    'table6_crso_info',
  ],
  layout : {
    full : {text : 12, graph: [4,8]},
    half: {text : 12, graph: [12,12]},
  },
  title :"planned_program_spending_title",
  text : "planned_program_spending_text",
  calculate(subject,info){

    const {table6} = this.tables;
    const table6_data = table6.q(subject).data;

    const planning_data = _.map(planning_years, function(row) {
      return d3.sum(_.map(table6_data, xx => xx[row]))
    })


    if (d3.sum(planning_data) === 0) {
      return false;      
    }
    
    return  (
      _.chain( table6.q(subject).data)
        .filter(row => {
          return d3.sum(planning_years, col=> row[col]) !== 0;
        })
        .map(row => 
          ({
            label : row.prgm ,
            data : planning_years.map(col => row[col]),
            active : false,
          })
        )
        .sortBy(x => -d3.sum(x.data))
        .value()
    );
  },

  render(panel,calculations){
    const { graph_args, info } = calculations;
    return D3.create_graph_with_legend.call({panel},{
      bar : true,
      get_data :  _.property("data"),
      data :  graph_args,
      ticks : info.planning_years,
      y_axis : "($)",
      legend_title : "program",
      stacked: false,
    });
  },
});

new PanelGraph({
  level: "crso",
  footnotes : ["PLANNED_EXP"],
  key : "planned_program_fte",
  depends_on: ['table12'],
  info_deps: ['table12_crso_info'],
  layout : {
    full : {text : 12, graph: [4,8]},
    half: {text : 12, graph: [12,12]},
  },
  title :"planned_program_fte_title",
  text : "planned_program_fte_text",
  calculate(subject,info){


    const {table12} = this.tables;
    const fte_data = table12.q(subject).data

    const planning_data = _.map(planning_years, function(row) {
      return d3.sum(_.map(fte_data, xx => xx[row]))
    })

    if (d3.sum(planning_data) === 0) {
      return false;      
    }
    
    return  (
      _.chain(fte_data)
        .filter(row => {
          return d3.sum(planning_years, col=> row[col]) !== 0;
        })
        .map(row => 
          ({
            label : row.prgm ,
            data : planning_years.map(col => row[col]),
            active : false,
          })
        )
        .sortBy(x => -d3.sum(x.data))
        .value()
    );
  },

  render(panel,calculations){
    const { graph_args, info } = calculations;
    return D3.create_graph_with_legend.call({panel},{
      bar : true,
      get_data :  _.property("data"),
      data :  graph_args,
      ticks : info.planning_years,
      y_axis : "($)",
      legend_title : "program",
      stacked: false,
    });
  },
});


