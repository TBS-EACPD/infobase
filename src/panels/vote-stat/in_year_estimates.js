import './vote-stat-text.ib.yaml';
import {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  years,
  D3,
} from "../shared";

const { estimates_years } = years;

const common_calc = function( subject,info,options) {
  const {table8} = this.tables;
  const gov_q = table8.q();
  const ticks =  _.map(estimates_years,run_template);
  const series = { 
    [text_maker("government_stats")] :  _.map(estimates_years, year => gov_q.sum(year+"_estimates")),
  };
  if (subject.is("dept")){
    const dept_q = table8.q(subject);
    series[subject.sexy_name] = _.map(estimates_years, year => dept_q.sum(year+"_estimates"));
  }
  return { series, ticks };
};

const common_render = function( panel,calculations,options) {
  const {
    graph_args: {
      ticks,
      series,
    },
    subject,
  } = calculations;



  const gov_label = text_maker("government_stats");

  const series_labels = (
    subject.is('dept') ? 
    [ subject.sexy_name, gov_label ] :
    [ gov_label ]
  );


  const graph_area = panel.areas().graph;


  if (subject.is("dept")){
    graph_area.append('div').classed('x1',true).style("display", "flex");
    graph_area.append('div').classed('x2',true).style('position','relative');
    const data = _.map(series_labels,label => ({
      label, 
      active: label !== gov_label, 
      data :  series[label],
    }));

    D3.create_graph_with_legend.call({panel},{
      get_data: _.property('data'), 
      data,
      ticks : ticks,
      legend_classs :  "legend font-xsmall",
      legend_orientation : "horizontal",
      yaxis_formatter : formats.compact1_raw,  
      bar : true,
      stacked : false,
      y_axis : "$",
      sort_data: false,
    });

  } else {

    new D3.BAR.bar(
      graph_area.node(),
      { 
        add_xaxis : true,                                   
        x_axis_line : true,                                
        add_yaxis : false,                                  
        add_labels : true,                                  
        margin : {top: 20, right:20, left: 60, bottom: 20} ,
        colors: infobase_colors(),
        series_labels,
        formater : formats.compact1,  
        series,  
        ticks,
      }
    ).render({});

  }
};

new PanelGraph({
  level: "dept",
  depends_on :  ["table8"],
  machinery_footnotes : false,
  info_deps: [
    'table8_dept_info',
    'table8_gov_info',
  ],
  key: 'in_year_estimates',
  height :  300,
  layout:{
    full : {text : 5, graph: 7},
    half : {text : 12, graph: [12,12]},
  },
  title :  "in_year_estimates_title",
  text :  "dept_in_year_estimates_text",
  include_in_bubble_menu : true,
  bubble_text_label : "estimates",
  calculate : common_calc,
  render : common_render,
});

new PanelGraph({
  level: "gov",
  depends_on :  ["table8"],
  info_deps: ['table8_gov_info'],
  key: 'in_year_estimates',
  height : 150,
  layout:{
    full : {text : 5, graph: 7},
    half : {text : 12, graph: 12},
  },
  title :  "in_year_estimates_title",
  text : "gov_in_year_estimates_text",
  include_in_bubble_menu : true,
  bubble_text_label : "estimates",
  calculate : common_calc ,
  render: common_render,
});

