import { text_maker, TM } from './vote_stat_text_provider.js';
import {
  StdPanel,
  Col,
  
  CommonDonut,

  declare_panel,
} from "../../shared.js";

const render_w_options = ({text_key, graph_col, text_col}) => ({calculations, sources, footnotes, glossary_keys}) => {
  const { info, panel_args } = calculations;

  const data = _.map(
    panel_args,
    (data_set) => ({
      ...data_set,
      id: data_set.label,
    })
  );

  return (
    <StdPanel
      title={text_maker("vote_stat_split_title")}
      {...{footnotes,sources,glossary_keys}}
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
  levels: ["program"],
  panel_config_func: (level, panel_key) => ({
    depends_on: ['programVoteStat'],
    info_deps: ["programVoteStat_program_info"],
    footnotes: ["VOTED", "STAT"],
    glossary_keys: ["AUTH"],
  
    calculate(subject,info,options){
      const {programVoteStat} = this.tables;
      const vote_stat = _.map(
        programVoteStat.programs.get(subject), 
        row => ({
          label: row.vote_stat,
          value: row["{{pa_last_year}}"],
        })
      );
      
      // check for either negative voted or statutory values, or 0 for both
      if ( 
        (_.every( vote_stat, ({value}) => value === 0)) ||
        (_.minBy(vote_stat, 'value').value < 0 && _.maxBy(vote_stat, 'value').value >= 0)
      ){
        return false;
      }
  
      return vote_stat;
    },
  
    render: render_w_options({
      text_key: "program_vote_stat_split_text",
      graph_col: 7,
      text_col: 5,
    }),
  }),
});
