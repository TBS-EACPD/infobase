import text from "./employee_totals.yaml";
import {
  formats,
  run_template,
  year_templates,
  create_text_maker_component,
  declarative_charts,
  StdPanel,
  Col,
  NivoResponsiveLine,
  businessConstants,

  declare_panel, 
} from "../shared.js"; 

const { months } = businessConstants;

const { text_maker, TM } = create_text_maker_component(text);

const {
  people_years, 
  people_years_short_second,
} = year_templates;

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


export const declare_employee_totals_panel = () => declare_panel({
  panel_key: "employee_totals",
  levels: ["gov", "dept"],
  panel_config_func: (level, panel_key) => ({
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
      const { subject, info, panel_args } = calculations;
      const { series, ticks } = panel_args;

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
                <NivoResponsiveLine
                  data = { data_formatter()}
                  raw_data = {series}
                  colors = { window.infobase_color_constants.primaryColor }
                  is_money = {false}
                  yScale = {{toggle: true}}
                  tooltip = {slice =>  
                    <div style={{color: window.infobase_color_constants.textColor}}>
                      <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <tbody>
                          { slice.data.map(
                            tooltip_item => ( 
                              <tr key = {tooltip_item.serie.id}>
                                <td className="nivo-tooltip__content">
                                  <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.serie.color}} />
                                </td>
                                <td className="nivo-tooltip__content"> {tooltip_item.serie.id} </td>
                                <td className="nivo-tooltip__content"> {tooltip_item.data.x}</td>
                                <td className="nivo-tooltip__content" dangerouslySetInnerHTML={{__html: formats.big_int(tooltip_item.data.y)}} />
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>}
                />
              </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("org")} 
                data_col_headers = {ticks}
                data = {[{
                  label: subject.fancy_name, 
                  data: series,
                }]}
              />
            </Col>
          }
        </StdPanel>
      );
    },
  }),
});
