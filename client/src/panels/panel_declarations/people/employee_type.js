import text from "./employee_type.yaml";
import { AverageSharePie } from './AverageSharePie.js';
import {
  formats,
  run_template,
  businessConstants,
  years,
  create_text_maker_component,
  declarative_charts,
  StdPanel,
  Col,

  declare_panel,

  LineBarToggleGraph,
  HeightClippedGraph,
} from "../shared.js"; 

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = years;
const { tenure } = businessConstants;

const { A11YTable } = declarative_charts;


const info_deps_by_level = {
  gov: ['orgEmployeeType_gov_info'],
  dept: [
    'orgEmployeeType_gov_info',
    'orgEmployeeType_dept_info',
  ],
};

const calculate_funcs_by_level = {
  gov: function(gov,info){
    const {orgEmployeeType} = this.tables;				  
    return _.chain(tenure)
      .values()
      .map(tenure_type => {
        const tenure_text = tenure_type.text;
        const yearly_values = people_years.map(year => orgEmployeeType.horizontal(year, false)[tenure_text]);
        return {
          label: tenure_text,
          data: yearly_values,
          five_year_percent: yearly_values.reduce(function(sum, val) { return sum + val; }, 0)/info.gov_five_year_total_head_count,
          active: true,
        };
      })
      .sortBy( d => -d3.sum(d.data) )
      .value();
  },
  dept: function(dept,info){
    const {orgEmployeeType} = this.tables;
    return _.chain(orgEmployeeType.q(dept).data)
      .map(row =>
        ({
          label: row.employee_type,
          data: people_years.map(year => row[year]),
          five_year_percent: row.five_year_percent,
          active: true,
        })
      )
      .filter( d => d3.sum(d.data) !== 0 )
      .sortBy( d => -d3.sum(d.data) )
      .value();
  },
};


export const declare_employee_type_panel = () => declare_panel({
  panel_key: "employee_type",
  levels: ["gov", "dept"],
  panel_config_func: (level, panel_key) => ({
    depends_on: ['orgEmployeeType'],
    info_deps: info_deps_by_level[level],
    glossary_keys: ['INDET_PEOPLE', 'TERM_PEOPLE', 'CASUAL_PEOPLE', 'STUD_PEOPLE'],
    calculate: calculate_funcs_by_level[level],
  
    render({calculations, footnotes, sources, glossary_keys}){
      const { info, panel_args } = calculations;
      
      const ticks = _.map(people_years, y => `${run_template(y)}`);

      return (
        <StdPanel
          title={text_maker("employee_type_title")}
          {...{footnotes, sources, glossary_keys}}
        >
          <Col size={12} isText>
            <TM k={level+"_employee_type_text"} args={info} />
          </Col>
          { !window.is_a11y_mode &&
            <Col size={12} isGraph>
              <AverageSharePie
                panel_args = {panel_args}
                label_col_header = {text_maker("employee_type")}
              />
            </Col>
          }
          { !window.is_a11y_mode && level === "dept" &&
            <Col size={12} isGraph>
              <HeightClippedGraph>
                <LineBarToggleGraph 
                  {...{
                    legend_title: text_maker("employee_type"),
                    bar: true,
                    graph_options: {
                      ticks: ticks,
                      y_axis: text_maker("employees"),
                      formatter: formats.big_int_raw,
                    },
                    initial_graph_mode: "bar_stacked",
                    data: panel_args,
                  }}
                />
              </HeightClippedGraph>
            </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("employee_type")}
                data_col_headers = {[...ticks, text_maker("five_year_percent_header")]}
                data = {_.map(panel_args, 
                  dimension => { 
                    return {label: dimension.label, data: [...dimension.data, formats["percentage1_raw"](dimension.five_year_percent)]}; 
                  }
                )}
              />
            </Col>
          }
        </StdPanel>
      );
    },
  }),
});
