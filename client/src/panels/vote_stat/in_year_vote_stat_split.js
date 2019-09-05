import { text_maker, TM } from './vote_stat_text_provider.js';
import {
  declare_panel,
  StdPanel,
  Col,
  CommonDonut,
} from "../shared";


const render_w_options = ({graph_col, text_col, text_key}) => ({calculations,footnotes,sources}) => {
  const { 
    graph_args,
    info,
  } = calculations;

  const data = _.map(
    graph_args,
    (data_set) => ({
      ...data_set,
      id: data_set.label,
    })
  );

  return (
    <StdPanel 
      title={text_maker("in_year_voted_stat_split_title")}
      {...{sources,footnotes}}
    >
      <Col isText size={text_col}>
        <TM k={text_key} args={info} />
      </Col>
      {!window.is_a11y_mode &&
        <Col isGraph size={graph_col}>
          <CommonDonut
            graph_data = {data}
            legend_data ={data}
            graph_height = '400px'
          /> 
        </Col>
      }
    </StdPanel>
  );
};


export const declare_in_year_voted_stat_split_panel = () => declare_panel({
  panel_key: "in_year_voted_stat_split",
  levels: ["gov", "dept"],
  panel_config_func: (level, panel_key) => {
    switch (level){
      case "gov":
        return {
          depends_on: ['orgVoteStatEstimates'],
          machinery_footnotes: false,
          info_deps: ['orgVoteStatEstimates_gov_info'],
        
          calculate(subject,info){
            return [
              {value: info.gov_stat_est_in_year, label: text_maker("stat") },
              {value: info.gov_voted_est_in_year, label: text_maker("voted") },
            ];
          },
          render: render_w_options({
            text_key: "gov_in_year_voted_stat_split_text",
            text_col: 7,
            graph_col: 5,
          }),
        };
      case "dept":
        return {
          depends_on: ['orgVoteStatEstimates'],
          info_deps: ['orgVoteStatEstimates_dept_info', 'orgVoteStatEstimates_gov_info' ],
          machinery_footnotes: false,
          calculate(subject,info){
            // check for negative voted or statutory values, or 0 for both
            if ( 
              info.dept_stat_est_in_year < 0 || 
              info.dept_voted_est_in_year < 0 ||
              (info.dept_stat_est_in_year === 0 && info.dept_stat_est_in_year === 0)
            ){
              return false;
            }
            return [
              {value: info.dept_stat_est_in_year, label: text_maker("stat") },
              {value: info.dept_voted_est_in_year, label: text_maker("voted") },
            ];
          },
          render: render_w_options({
            text_key: "dept_in_year_voted_stat_split_text",
            graph_col: 6,
            text_col: 6,
          }),
        };
    }
  },
});