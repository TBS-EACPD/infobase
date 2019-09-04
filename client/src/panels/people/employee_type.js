import text from "./employee_type.yaml";
import {
  formats,
  run_template,
  declare_panel,
  PplSharePie,
  LineBarToggleGraph,
  HeightClippedGraph,
  businessConstants,
  years,
  create_text_maker_component,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared"; 

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
    key: panel_key,
    level: level,
    depends_on: ['orgEmployeeType'],
    info_deps: info_deps_by_level[level],
    calculate: calculate_funcs_by_level[level],
  
    render({calculations, footnotes, sources}){
      const { info, graph_args } = calculations;
      
      const ticks = _.map(people_years, y => `${run_template(y)}`);
      
      return (
        <StdPanel
          title={text_maker("employee_type_title")}
          {...{footnotes, sources}}
        >
          <Col size={12} isText>
            <TM k={level+"_employee_type_text"} args={info} />
          </Col>
          { !window.is_a11y_mode &&
            <Col size={12} isGraph>
              <PplSharePie
                graph_args = {graph_args}
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
                      formatter: formats.big_int_real_raw,
                    },
                    initial_graph_mode: "bar_stacked",
                    data: graph_args,
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
                data = {_.map(graph_args, 
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