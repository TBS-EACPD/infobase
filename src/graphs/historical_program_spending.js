const {
  PanelGraph,
  years : {std_years},
  D3} = require("./shared"); 
const auth_cols = _.map(std_years, yr=>yr+"auth");
const exp_cols = _.map(std_years, yr=>yr+"exp");

new PanelGraph({
  level: "dept",
  footnotes : ["PLANNED_EXP"],
  key : "historical_program_spending",
  depends_on: ['table6'],

  info_deps: [
    'table6_dept_info',
  ],

  layout : {
    full : {text : 12, graph: [4,8]},
    half: {text : 12, graph: [12,12]},
  },

  title :"dept_historical_program_spending_title",
  text : "dept_historical_program_spending_text",

  calculate(subject,info){
    const {table6} = this.tables;
    return  (
      _.chain( table6.q(subject).data)
        .filter(row => {
          return d4.sum(auth_cols.concat(exp_cols), col=> row[col]) !== 0;
        })
        .map(row => 
          ({
            label : row.prgm ,
            data : exp_cols.map(col => row[col]),
            active : false,
          })
        )
        .sortBy(x => -d4.sum(x.data))
        .value()
    );
  },

  render(panel,calculations){
    const { graph_args, info } = calculations;
    return D3.create_graph_with_legend.call({panel},{
      bar : true,
      get_data :  _.property("data"),
      data :  graph_args,
      no_toggle_graph : true,
      ticks : info.last_years,
      y_axis : "($)",
      legend_title : "program",
    });
  },
});

new PanelGraph({
  level: "crso",
  footnotes : ["PLANNED_EXP"],
  key : "historical_program_spending",
  depends_on: ['table6'],
  info_deps: [
    'table6_crso_info',
  ],
  layout : {
    full : {text : 12, graph: [4,8]},
    half: {text : 12, graph: [12,12]},
  },
  title :"historical_program_spending_title",
  text : "historical_program_spending_text",
  calculate(subject,info){

    const {table6} = this.tables;
    const table6_data = table6.q(subject).data;

    const auth = _.map(auth_cols, function(row) {
      return d4.sum(_.map(table6_data, xx => xx[row]))
    })

    const exp = _.map(exp_cols, function(row) {
      return d4.sum(_.map(table6_data, xx => xx[row]))
    })

    if (d4.sum(auth) === 0 && d4.sum(exp)===0 ) {
      return false;      
    }

    return  (
      _.chain( table6.q(subject).data)
        .filter(row => {
          return d4.sum(auth_cols.concat(exp_cols), col=> row[col]) !== 0;
        })
        .map(row => 
          ({
            label : row.prgm ,
            data : exp_cols.map(col => row[col]),
            active : false,
          })
        )
        .sortBy(x => -d4.sum(x.data))
        .value()
    );
  },

  render(panel,calculations){
    const { graph_args, info } = calculations;
    return D3.create_graph_with_legend.call({panel},{
      bar : true,
      get_data :  _.property("data"),
      data :  graph_args,
      ticks : info.last_years,
      y_axis : "($)",
      legend_title : "program",
    });
  },
});

