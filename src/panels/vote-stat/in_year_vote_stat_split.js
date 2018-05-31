import './vote-stat-text.ib.yaml';
import {
  text_maker,
  common_react_donut,
  PanelGraph,
} from "../shared";

const pie_height = 300;

new PanelGraph({
  is_old_api: true,
  level: "dept",
  height: pie_height,
  key: 'in_year_voted_stat_split',
  depends_on :  ['table8'],
  info_deps: ['table8_dept_info', 'table8_gov_info' ],

  layout: {
    full:  {text : 6, graph: 6},       
    half : {text : 12, graph: 12},      
  },

  machinery_footnotes : false,
  title :  "in_year_voted_stat_split_title",
  text : "dept_in_year_voted_stat_split_text",

  calculate(subject,info){
    // check for negative voted or statutory values
    if ( info.dept_stat_est_in_year <= 0 || info.dept_voted_est_in_year <= 0 ){
      return false;
    }
    return [
      {value:info.dept_stat_est_in_year, label : text_maker("stat") },
      {value:info.dept_voted_est_in_year, label :text_maker("voted") },
    ];
  },

  render: window.is_a11y_mode ? _.noop : common_react_donut,
});

new PanelGraph({
  is_old_api: true,
  level: "gov",
  height: pie_height,
  key: 'in_year_voted_stat_split',
  depends_on :  ['table8'],
  machinery_footnotes : false,
  info_deps : ['table8_gov_info'],

  layout: {
    full:  {text : 7, graph: 5},       
    half : {text : 12, graph: 12},      
  },

  title :  "in_year_voted_stat_split_title",
  text : "gov_in_year_voted_stat_split_text",

  calculate(subject,info){
    return   [
      {value:info.gov_stat_est_in_year, label : text_maker("stat") },
      {value:info.gov_voted_est_in_year, label :text_maker("voted") },
    ];
  },

  render: window.is_a11y_mode ? _.noop : common_react_donut,
});

