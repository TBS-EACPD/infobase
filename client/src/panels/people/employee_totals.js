import text from "./employee_totals.yaml"
import {
  formats,
  run_template,
  PanelGraph, 
  years,
  create_text_maker_component,
  declarative_charts,
  StdPanel,
  Col,
  NivoResponsiveLine,
} from "../shared"; 

import { businessConstants } from '../../models/businessConstants';

const { months } = businessConstants;

const { text_maker, TM } = create_text_maker_component(text);

const {
  people_years, 
  people_years_short_second,
} = years;

const {
  A11YTable,
} = declarative_charts;

const info_deps_by_level = {
  gov: ['orgEmployeeType_gov_info'],
  dept: [
    'orgEmployeeType_gov_info',
    'orgEmployeeType_dept_info',
  ],
};

["gov", "dept"].map(
  level => new PanelGraph({
    key: "employee_totals",
    level: level,
    depends_on: ['orgEmployeeType'],
    info_deps: info_deps_by_level[level],

    calculate(subject, info){
      const {orgEmployeeType} = this.tables;
      const q = orgEmployeeType.q(subject);
      return { 
        series: people_years.map(y => q.sum(y)),
        ticks: _.map(people_years_short_second, y => `${run_template(y)}`),
      };
    },

    render({calculations, footnotes, sources}){
      const { subject, info, graph_args } = calculations;
      const { series, ticks } = graph_args;

      const data_formatter = () =>([{
        id: months[3].text,
        data: _.map(series, (data, index) =>({
          x: ticks[index],
          y: data,
        })),
      }]);
      
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
               <div style ={{height: '400px'}} aria-hidden = {true}>
                 <NivoResponsiveLine
                   data = { data_formatter()}
                   colors = "#335075"
                   is_money = {false}
                   tooltip = {slice =>  
                     <div style={{color: '#000'}}>
                       <table style={{width: '100%', borderCollapse: 'collapse'}}>
                         <tbody>
                           { slice.data.map(
                             tooltip_item => ( 
                               <tr key = {tooltip_item.serie.id}>
                                 <td style= {{padding: '3px 5px'}}>
                                   <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.serie.color}} />
                                 </td>
                                 <td style={{padding: '3px 5px'}}> {tooltip_item.serie.id} </td>
                                 <td style = {{padding: '3px 5px'}}> {tooltip_item.data.x}</td>
                                 <td style={{padding: '3px 5px'}} dangerouslySetInnerHTML={{__html: formats.big_int_real(tooltip_item.data.y)}} />
                               </tr>
                             )
                           )}
                         </tbody>
                       </table>
                     </div>}
                 />
               </div>
             </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("org")} 
                data_col_headers = {ticks}
                data = {[{
                  label: subject.fancy_name, 
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