import './vote-stat-text.ib.yaml';
import {
  PanelGraph,
  common_react_donut,
} from "../shared";

new PanelGraph({
  key: 'vote_stat_split',
  depends_on : ['table300'],
  info_deps: ["table300_program_info"],
  layout: {
    full: {text: 5, graph: 7},
    half : {text: 12, graph: 12},
  },
  level : "program",
  footnotes : ["VOTED", "STAT"],
  title : "vote_stat_split_title",
  text :  "program_vote_stat_split_text",
  calculate(subject,info,options){ 
    const {table300} = this.tables;
    const vote_stat =  _.map(
      table300.programs.get(subject), 
      row => ({
        label : row.vote_stat,
        value : row["{{pa_last_year}}"],
      })
    );

    if(_.isEmpty(vote_stat)){
      return false;
    }

    return vote_stat;
  },
  render: window.is_a11y_mode ? _.noop : common_react_donut,
});


new PanelGraph({
  key: 'vote_stat_split',
  depends_on : ['table300'],
  info_deps: ["table300_tag_info"],
  footnotes : ["VOTED", "STAT"],
  layout: {
    full: {text: 7, graph: 5},
    half : {text: 12, graph: 12},
  },
  level : "tag",
  title : "vote_stat_split_title",
  text :  "tag_vote_stat_split_text",
  calculate(subject,info,options){ 
    const {table300} = this.tables;

    return _.chain(table300.q(subject).data)
      .groupBy("vote_stat")
      .map((lines, key)=> {
        return {
          label : key,
          value : d3.sum(lines,_.property("{{pa_last_year}}")),
        }
      })
      .value();
  },
  render: window.is_a11y_mode ? _.noop : common_react_donut,
});


