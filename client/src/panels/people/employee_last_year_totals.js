import text1 from "./employee_last_year_totals.yaml";
import text2 from "../../common_text/common_lang.yaml";
import {
  declare_panel,
  formatter,
  create_text_maker_component,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared"; 

const { text_maker, TM } = create_text_maker_component([text1, text2]);

const { LiquidFillGauge } = declarative_charts;


export const declare_employee_last_year_totals_panel = () => declare_panel({
  panel_key: "employee_last_year_totals",
  levels: ["dept"],
  panel_config_func: (level, panel_key) => ({
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
        
        const dept_emp_value = graph_args.vals[1].value;
        const gov_emp_value = graph_args.vals[0].value;
        const dept_emp_fmt = formatter("compact", dept_emp_value, {raw: true, noMoney: true, precision: 1});
        const gov_emp_fmt = formatter("compact", gov_emp_value, {raw: true, noMoney: true, precision: 1});    
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
                value={dept_emp_value}
                totalValue = {gov_emp_value}
                descriptiveTextValue={`${dept_emp_fmt} ${text_maker("of")} ${gov_emp_fmt}`}
                margin = {{
                  top: 10,
                  right: 0,
                  bottom: 10,
                  left: 0,          
                }}
              />
            </Col>
          </StdPanel>
        );
      }
    },
  }),
});