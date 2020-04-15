import { TM, text_maker } from './vote_stat_text_provider.js';
import {
  StdPanel,
  Col,
  CircleProportionChart,

  declare_panel,
} from "../../shared.js";

const DeptEstimatesPerspective = ({subject, dept_total, gov_total}) => (

  <CircleProportionChart 
    height={250}
    child_value={dept_total}
    child_name={subject.name}
    parent_value={gov_total}
    parent_name={text_maker("government_stats")}
  />

);


export const declare_estimates_in_perspective_panel = () => declare_panel({
  panel_key: "estimates_in_perspective",
  levels: ["dept"],
  panel_config_func: (level, panel_key) => ({
    depends_on: ["orgVoteStatEstimates"],
    machinery_footnotes: false,
  
    info_deps: [
      'orgVoteStatEstimates_dept_info',
      'orgVoteStatEstimates_gov_info',
    ],
  
    calculate(subject, info, options){
      const { gov_tabled_est_in_year, dept_tabled_est_in_year_estimates } = info;
      if(dept_tabled_est_in_year_estimates){
        return {
          gov_total: gov_tabled_est_in_year,
          dept_total: dept_tabled_est_in_year_estimates,
        };
      } else {
        return false;
      }
    },
  
    render({calculations, footnotes, sources}){
      const { subject, panel_args, info } = calculations;
      return (
        <StdPanel
          title={text_maker("estimates_perspective_title")}
          {...{footnotes, sources}}
        >
          <Col isText size={5}>
            <TM k="estimates_perspective_text" args={info} />
          </Col>
          {!window.is_a11y_mode &&
            <Col isGraph size={7}>
              <DeptEstimatesPerspective
                subject={subject} 
                {...panel_args} 
              />
            </Col>
          }
        </StdPanel>
      );
    },
  }),
});
