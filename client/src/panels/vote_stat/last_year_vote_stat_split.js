import { text_maker, TM } from './vote_stat_text_provider.js';
import {
  declare_panel,
  StdPanel,
  Col,
  CommonDonut,
} from "../shared";

const render_w_options = ({text_key, graph_col, text_col}) => ({calculations, sources, footnotes}) => {
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
          <CommonDonut
            graph_data = {data}
            legend_data = {data}
            graph_height = '400px'
          />
        </Col>
      }
    </StdPanel>
  );
};


export const declare_vote_stat_split_panel = () => declare_panel({
  panel_key: "vote_stat_split",
  levels: ["program", "tag"],
  panel_config_func: (level, panel_key) => {
    switch (level){
      case "program":
        return {
          level,
          key: panel_key,
          depends_on: ['programVoteStat'],
          info_deps: ["programVoteStat_program_info"],
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
        };
      case "tag":
        return {
          level,
          key: panel_key,
          depends_on: ['programVoteStat'],
          info_deps: ["programVoteStat_tag_info"],
          footnotes: ["VOTED", "STAT"],
          calculate(subject,info,options){ 
            const {programVoteStat} = this.tables;
        
            return _.chain(programVoteStat.q(subject).data)
              .groupBy("vote_stat")
              .map((lines, key)=> {
                return {
                  label: key,
                  value: d3.sum( lines, _.property("{{pa_last_year}}") ),
                };
              })
              .value();
          },
        
          render: render_w_options({
            text_key: "tag_vote_stat_split_text",
            graph_col: 5,
            text_col: 7,
          }),
        };
    }
  },
});