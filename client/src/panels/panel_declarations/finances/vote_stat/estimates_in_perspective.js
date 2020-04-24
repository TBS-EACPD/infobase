import { TM, text_maker } from './vote_stat_text_provider.js';
import {
  StdPanel,
  Col,
  CircleProportionChart,

  declare_panel,
} from "../../shared.js";

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
      const {
        subject,
        info,
        panel_args: {
          gov_total,
          dept_total,
        },
      } = calculations;

      return (
        <StdPanel
          title={text_maker("estimates_perspective_title")}
          {...{footnotes, sources}}
          allowOverflow={true}
        >
          <Col isText size={!window.is_a11y_mode ? 5 : 12}>
            <TM k="estimates_perspective_text" args={info} />
          </Col>
          { !window.is_a11y_mode &&
            <Col isGraph size={7}>
              <CircleProportionChart 
                height={250}
                child_value={dept_total}
                child_name={text_maker('dept_estimates', {subject})}
                parent_value={gov_total}
                parent_name={text_maker('gov_estimates')}
              />
            </Col>
          }
        </StdPanel>
      );
    },
  }),
});
