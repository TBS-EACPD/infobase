const {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  years : {std_years},
  D3,
  util_components: {
    Format,
  },
} = require("./shared"); 
const auth_cols = _.map(std_years, yr=>yr+"auth");
const exp_cols = _.map(std_years, yr=>yr+"exp");


const calculate = function( subject,info,options ) {
  const {
    table6,
    table4, 
  } = this.tables;

  let stacked = false;
  let auth,exp;

  if (subject.is("gov")){
    const q = table4.q();
    auth = q.sum(auth_cols,{as_object:false});
    exp = q.sum(exp_cols,{as_object:false});
  } else if (  subject.is("dept")) {
    const q = table4.q(subject);
    auth = q.sum(auth_cols,{as_object:false});
    exp = q.sum(exp_cols,{as_object:false});
  } else if (  subject.is("program") ) {
    const row = _.first(table6.programs.get(subject));
    auth = _.map(auth_cols, col => row[col] );
    exp =   _.map(exp_cols, col => row[col] );
    if (d4.sum(auth) === 0 && d4.sum(exp)===0 ) {
      return false;
    }
  } else if (  subject.level === 'tag') {
    if(subject.is('tag') && subject.root.id !== 'GOCO'){ 
      //turn off this graph for Many-to-many tags 
      return false; 
    }
    const q = table6.q(subject);
    auth = q.sum(auth_cols,{as_object:false});
    exp = q.sum(exp_cols,{as_object:false});
  }

  if  (_.every(auth, (x,i)=> auth[i]-exp[i] >= 0   ) &&
        _.every(auth.concat(exp), d=> d>=0)
  ){
    auth = _.map(auth, (x,i)=> auth[i] - exp[i]);
    stacked = true;
  }
  return {exp,auth,stacked};
};

const render = function( panel, calculations, options ) {

  const ticks = _.map(std_years, run_template);
  
  const graph_area = panel.areas().graph;
  const {exp,auth,stacked} = calculations.graph_args;
  
  const series_labels = (
    stacked ? 
    [text_maker("expenditures"),text_maker("unused_authorities" )] : 
    [text_maker("authorities"),text_maker("expenditures")]
  );

  if(window.is_a11y_mode){
    const data = _.zip(
      ticks,
      (
        stacked ? 
        _.zip(exp, auth) :
        _.zip(auth,exp)
      )
    ).map( ([label,data ])=>({
      label,
      /* eslint-disable react/jsx-key */
      data: data.map( amt => <Format type="compact1" content={amt} /> ),
    }));

    D3.create_a11y_table({
      container: graph_area,
      data_col_headers: series_labels,
      data,
    });

  } else {
    const colors = infobase_colors();
    const legend_area = graph_area.append("div");
    const new_graph_area = graph_area.append("div").style("position","relative");

    D3.create_list(legend_area.node(), series_labels, {
      colors ,
      orientation : "horizontal",
      legend : true,
      ul_classes : "legend",
    });

    (new D3.BAR.bar( new_graph_area.node(),
      {
        colors ,
        series_labels,
        ticks,
        stacked, 
        formater : formats.compact_raw,
        height : 400,
        series : {
          [series_labels[0]] :  stacked ? exp : auth,
          [series_labels[1]] :  stacked ? auth : exp,
        },
      })).render();
  }
  
};

new PanelGraph({
  level: "gov",
  key : "historical_auth_exp",
  info_deps : ["table4_gov_info"],
  depends_on: ["table4"],
  title: "historical_auth_exp_title",
  text: "gov_historical_auth_exp_text",
  layout : {
    full : {text : 6, graph: 6},
    half: {text : 12, graph: 12},
  },

  calculate,
  render,
});

new PanelGraph({
  level: "dept",
  key : "historical_auth_exp",
  depends_on: ["table4"],
  info_deps : ["table4_dept_info"],
  title: "historical_auth_exp_title",
  text: "dept_historical_auth_exp_text",
  layout : {
    full : {text : 6, graph: 6},
    half: {text : 12, graph: 12},
  },

  calculate,
  render,
});

new PanelGraph({
  level: "program",
  key : "historical_auth_exp",
  depends_on: ["table6"],
  info_deps : ["table6_program_info"],
  title: "historical_auth_exp_title",
  text: "program_historical_auth_exp_text",

  layout : {
    full : {text : 6, graph: 6},
    half: {text : 12, graph: 12},
  },

  calculate,
  render,
});

new PanelGraph({
  level: "tag",
  key : "historical_auth_exp",
  depends_on: ["table6"],
  info_deps : ["table6_tag_info"],
  title: "historical_auth_exp_title",
  text: "tag_historical_auth_exp_text",

  layout : {
    full : {text : 6, graph: 6},
    half: {text : 12, graph: 12},
  },

  calculate,
  render,
});



