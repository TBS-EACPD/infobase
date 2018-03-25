import './vote-stat-text.ib.yaml';
import {
  formats,
  PanelGraph,
  reactAdapter,
  declarative_charts,
} from "../shared";

const { CirclePieChart } = declarative_charts;



new PanelGraph({
  level: "dept",
  depends_on :  ["table8"],
  machinery_footnotes : false,
  info_deps: [
    'table8_dept_info',
    'table8_gov_info',
  ],
  key: 'estimates_in_perspective',
  layout:{
    full : {text : 5, graph: 7},
    half : {text : 12, graph: [12,12]},
  },
  title :  "estimates_perspective_title",
  text :  "estimates_perspective_text",
  include_in_bubble_menu : true,
  bubble_text_label : "estimates",
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
  render(panel,calculations){
    const { subject, graph_args } = calculations;
    reactAdapter.render(
      <DeptEstimatesPerspective
        subject={subject} 
        {...graph_args} 
      />,
      panel.areas().graph.node()
    )
  },
});


const DeptEstimatesPerspective = ({subject, dept_total, gov_total}) => {

  return (
    <CirclePieChart
      height={250}
      colors={infobase_colors()}
      formater={formats.compact1}
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

