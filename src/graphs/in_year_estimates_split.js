const {
  formats,
  PanelGraph,
  D3,
} = require("./shared"); 

const estimates_split_calculate = function(subject, info,options){
  const in_year_estimates_split = info[subject.level+"_in_year_estimates_split"];
  const last_year_estimates_split = info[subject.level+"_last_year_estimates_split"];
  if (_.isEmpty(in_year_estimates_split)){
    return false;
  }
  return {
    in_year: {
      series : {'': _.map(in_year_estimates_split,1) },
      ticks :  _.map(in_year_estimates_split,0),
    },
    last_year: {
      series : {'': _.map(last_year_estimates_split,1) },
      ticks :  _.map(last_year_estimates_split,0),
    },
  };
};

//NOTE: Once supps A comes out, we'll need to switch all the est_last_year to est_in_year, here, in the titles and in the text.

const estimates_split_render = function(panel,calculations,options){
  const {
    graph_args : {
      in_year: in_year_bar_args,
    },
  } = calculations;

  const static_bar_args = {
    add_xaxis : true,
    x_axis_line : true,
    add_yaxis : false,
    add_labels : true,
    colors : infobase_colors(),
    margin : {top: 20, right:20, left: 60, bottom: 80},
    formater : formats.compact1,
  };

  panel.areas().graph.attr('aria-hidden',"true")

  let bar_mountpoint = panel.areas().graph;

  const bar_instance = new D3.BAR.bar(bar_mountpoint.node(), static_bar_args);
  bar_instance.render(in_year_bar_args);

};


new PanelGraph({
  level: "dept",
  machinery_footnotes : false,
  depends_on :  ["table8"],

  info_deps: [
    'table8_gov_info', 
    'table8_dept_info', 
  ],

  key : "in_year_estimates_split",

  layout : {
    "full" : {text : 5, graph: 7},
    "half" : {text : 12, graph: 12},
  },

  title :  "in_year_estimates_split_title",
  text :  "dept_in_year_estimates_split_text",
  calculate: estimates_split_calculate,
  render:   estimates_split_render,
});

new PanelGraph({
  level: "gov",
  machinery_footnotes : false,
  depends_on :  ["table8"],
  info_deps: ["table8_gov_info"],
  key : "in_year_estimates_split",

  layout : {
    "full" : {text : 5, graph: 7},
    "half" : {text : 12, graph: 12},
  },

  title :  "in_year_estimates_split_title",
  text :  "gov_in_year_estimates_split_text",
  calculate: estimates_split_calculate,
  render:   estimates_split_render,
});

