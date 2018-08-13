import text from "./employee_executive_level.yaml";
import {
  formats,
  run_template,
  PanelGraph,
  businessConstants,
  years,
  CTMTM,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared"; 

const [ text_maker, TM ] = CTMTM(text);

const { people_years } = years;
const { ex_levels } = businessConstants;

const {
  A11YTable,
  D3GraphWithLegend,
} = declarative_charts;


const info_deps_by_level = {
  gov: ['table112_gov_info'],
  dept: [
    'table112_gov_info',
    'table112_dept_info',
  ],
};

const calculate_funcs_by_level = {
  gov: function(gov, info){
    const {table112} = this.tables;
    
    const gov_five_year_total_head_count =_.chain(table112.q().gov_grouping())
      .map(row => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.chain(ex_levels)
      .values()
      .map(ex_level => {
        const ex_level_name = ex_level.text;
        const yearly_values = people_years.map(year => table112.horizontal(year,false)[ex_level_name]);
        return {
          label: ex_level_name,
          data: yearly_values,
          five_year_percent : yearly_values.reduce(function(sum, val) { return sum + val }, 0)/gov_five_year_total_head_count,
          active: (ex_level_name !== "Non-EX"),
        };
      })
      .sortBy(d => d.label)
      .value();
  },
  dept: function(dept, info){
    const {table112} = this.tables;
    return (
      table112.q(dept).data
        .map(row => ({
          label: row.ex_lvl,
          data: people_years.map(year => row[year]),
          five_year_percent: row.five_year_percent,
          active: (row.ex_lvl !== "Non-EX"),
        }))
        .filter(d => d3.sum(d.data) !== 0)
    );
  },
};

["gov", "dept"].map(
  level => new PanelGraph({
    key: "employee_executive_level",
    level: level,
    depends_on: ['table112'],
    info_deps: info_deps_by_level[level],
    calculate: calculate_funcs_by_level[level],
  
    render({calculations, footnotes, sources}){
      const { info, graph_args } = calculations;
      
      const ticks = _.map(people_years, y => `${run_template(y)}`);
      
      return (
        <StdPanel
          title={text_maker("employee_executive_level_title")}
          {...{footnotes, sources}}
        >
          <Col size={12} isText>
            <TM k={level+"_employee_executive_level_text"} args={info} />
          </Col>
          { !window.is_a11y_mode &&
            <Col size={12} isGraph>
              <D3GraphWithLegend
                options = {{
                  legend_col_full_size: 4,
                  graph_col_full_size: 8,
                  legend_class: 'fcol-sm-11 fcol-md-11',
                  y_axis: text_maker("employees"),
                  ticks: ticks,
                  bar: true,
                  yaxis_formatter: formats["big_int_real_raw"],
                  legend_title: text_maker("ex_level"),
                  get_data: _.property("data"),
                  data: graph_args,
                  "sort_data": false,
                }}
              />
            </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("ex_level")}
                data_col_headers = {[...ticks, text_maker("five_year_percent_header")]}
                data = {_.map(graph_args, 
                  dimension => { 
                    return {label: dimension.label, data: [...dimension.data, formats["percentage1_raw"](dimension.five_year_percent)]} 
                  }
                )}
              />
            </Col>
          }
        </StdPanel>
      );
    },
  })
);