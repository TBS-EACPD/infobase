import { text_maker, TM } from './vote-stat-text-prodiver.js';
import {
  PanelGraph,
  StdPanel,
  Col,
  NivoResponsivePie,
  infobaseCategory10Colors,
} from "../shared";

const render_w_options = ({text_key,graph_col,text_col}) => ({calculations, sources, footnotes}) => {
  const { info, graph_args } = calculations;

  const data = _.map(
    graph_args,
    (data_set) => ({
      ...data_set,
      id: data_set.label,
    })
  );

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
          <div style = {{height: '400px'}}>
            <NivoResponsivePie
              data = {data}
              colors = {infobaseCategory10Colors}
              legends = {[
                {
                  anchor: "bottom",
                  direction: "row",
                  translateY: 60,
                  translateX: 40,
                  itemWidth: 150,
                  itemHeight: 25,
                  symbolSize: 20,
                  symbolShape: "circle",
                },
              ]}
              theme = {{
                legends: {
                  text: {
                    fontSize: 15,
                  },
                },
              }}
            />
          </div>
        </Col>
      }
    </StdPanel>
  )
}

new PanelGraph({
  key: 'vote_stat_split',
  depends_on: ['programVoteStat'],
  info_deps: ["programVoteStat_program_info"],
  level: "program",
  footnotes: ["VOTED", "STAT"],

  calculate(subject,info,options){ 
    const {programVoteStat} = this.tables;
    const vote_stat = _.map(
      programVoteStat.programs.get(subject), 
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
  depends_on: ['programVoteStat'],
  info_deps: ["programVoteStat_tag_info"],
  footnotes: ["VOTED", "STAT"],
  level: "tag",
  calculate(subject,info,options){ 
    const {programVoteStat} = this.tables;

    return _.chain(programVoteStat.q(subject).data)
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


