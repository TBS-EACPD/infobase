import { text_maker, TM } from './vote-stat-text-prodiver.js';
import {
  PanelGraph,
  CommonDonut,
  StdPanel,
  Col,
} from "../shared";

const render_w_options = ({text_key,graph_col,text_col}) => ({calculations, sources, footnotes}) => {
  const { info, graph_args } = calculations;

  return (
    <StdPanel
      title={text_maker("vote_stat_split_title")}
      {...{footnotes,sources}}
    >
      <Col isText size={text_col}>
        <TM k={text_key} args={info} />
      </Col>
      { !window.is_a11y_mode &&
        <Col isGraph size={graph_col}>
          <CommonDonut data={graph_args} />
        </Col>
      }
    </StdPanel>
  )
}

new PanelGraph({
  key: 'vote_stat_split',
  depends_on: ['table300'],
  info_deps: ["table300_program_info"],
  level: "program",
  footnotes: ["VOTED", "STAT"],

  calculate(subject,info,options){ 
    const {table300} = this.tables;
    const vote_stat = _.map(
      table300.programs.get(subject), 
      row => ({
        label: row.vote_stat,
        value: row["{{pa_last_year}}"],
      })
    );

    if( _.every( vote_stat, ({value}) => value === 0) ){
      return false;
    }

    return vote_stat;
  },

  render: render_w_options({
    text_key: "program_vote_stat_split_text",
    graph_col: 7,
    text_col: 5,
  }),
});


new PanelGraph({
  key: 'vote_stat_split',
  depends_on: ['table300'],
  info_deps: ["table300_tag_info"],
  footnotes: ["VOTED", "STAT"],
  level: "tag",
  calculate(subject,info,options){ 
    const {table300} = this.tables;

    return _.chain(table300.q(subject).data)
      .groupBy("vote_stat")
      .map((lines, key)=> {
        return {
          label: key,
          value: d3.sum( lines, _.property("{{pa_last_year}}") ),
        }
      })
      .value();
  },

  render: render_w_options({
    text_key: "tag_vote_stat_split_text",
    graph_col: 5,
    text_col: 7,
  }),
});


