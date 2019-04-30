import { TM, text_maker } from './vote-stat-text-provider.js';
import {
  formats,
  PanelGraph,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared";

const { CirclePieChart } = declarative_charts;

new PanelGraph({
  level: "dept",
  depends_on: ["orgVoteStatEstimates"],
  machinery_footnotes: false,

  info_deps: [
    'orgVoteStatEstimates_dept_info',
    'orgVoteStatEstimates_gov_info',
  ],

  key: 'estimates_in_perspective',
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
    const { subject, graph_args, info } = calculations;
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
              {...graph_args} 
            />
          </Col>
        }
      </StdPanel>
    );
  },
});


const DeptEstimatesPerspective = ({subject, dept_total, gov_total}) => {

  return (
    <CirclePieChart
      height={250}
      colors={infobase_colors()}
      formatter={formats.compact1}
      font_size="16"
      data={[
        { name: "x", value: gov_total },
        { name: "y", value: dept_total },
      ]}
      margin={{
        top: 20,
        left: 10,
        bottom: 20,
        right: 10,

      }}
    />
  );

}

