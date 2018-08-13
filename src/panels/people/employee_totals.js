import text from "./employee_totals.yaml"
import {
  formats,
  run_template,
  PanelGraph, 
  years,
  CreateTmCmpnt,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared"; 

import { businessConstants } from '../../models/businessConstants';

const { months } = businessConstants;

const [ text_maker, TM ] = CreateTmCmpnt(text);

const {
  people_years, 
  people_years_short_second,
} = years;

const {
  A11YTable,
  Line,
} = declarative_charts;

const info_deps_by_level = {
  gov: ['table9_gov_info'],
  dept: [
    'table9_gov_info',
    'table9_dept_info',
  ],
};

["gov", "dept"].map(
  level => new PanelGraph({
    key: "employee_totals",
    level: level,
    depends_on: ['table9'],
    info_deps: info_deps_by_level[level],

    calculate(subject, info){
      const {table9} = this.tables;
      const q = table9.q(subject);
      return { 
        series: { '': people_years.map(y => q.sum(y)) },
        ticks: _.map(people_years_short_second, y => `${months[3].text}<br>${run_template(y)}`),
      };
    },

    render({calculations, footnotes, sources}){
      const { subject, info, graph_args } = calculations;
      const { series, ticks } = graph_args;
      
      return (
        <StdPanel
          title={text_maker(level+"_employee_totals_title")}
          {...{footnotes, sources}}
        >
          <Col size={4} isText>
            <TM k={level+"_employee_totals_text"} args={info} />
          </Col>
          { !window.is_a11y_mode &&
             <Col size={8} isGraph>
               <Line
                 series = {series}
                 ticks = {ticks}
                 colors = {infobase_colors()}
                 add_yaxis = {true}
                 add_xaxis = {true}
                 y_axis = {text_maker("employees")}
                 formater = {formats["big_int_real_raw"]}
               />
             </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("org")} 
                data_col_headers = {ticks}
                data = {[{
                  label: subject.sexy_name, 
                  data: series[""],
                }]}
              />
            </Col>
          }
        </StdPanel>
      );
    },
  })
);