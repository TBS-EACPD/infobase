import text from "./employee_last_year_totals.yaml";
import {
  PanelGraph,
  formats,
  create_text_maker_component,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared"; 

const { text_maker, TM } = create_text_maker_component(text);

const { LiquidFillGauge } = declarative_charts;

new PanelGraph({
  key: "employee_last_year_totals",
  level: "dept",
  depends_on: ['orgEmployeeType'],

  info_deps: [
    'orgEmployeeType_dept_info',
    'orgEmployeeType_gov_info',
  ],

  calculate(subject,info){
    return { 
      vals: [
        {name: "gov_last_year_emp", value: info.gov_head_count_ppl_last_year},
        {name: "dept_last_year_emp", value: info.dept_head_count_ppl_last_year},
      ],
      center: true,
    };
  },

  render({calculations, footnotes, sources}){
    if(window.is_a11y_mode){
      return;
    } else {
      const {info, graph_args} = calculations;

      return (
        <StdPanel
          title={text_maker("dept_employee_last_year_totals_title")}
          {...{footnotes, sources}}
        >
          <Col size={5} isText>
            <TM k="dept_employee_last_year_totals_text" args={info} />
          </Col>
          <Col size={7} isGraph>
            <LiquidFillGauge
              height = {300}
              value={graph_args.vals[1].value}
              totalValue = {graph_args.vals[0].value}
            />
          </Col>
        </StdPanel>
      );
    }
  },
});
