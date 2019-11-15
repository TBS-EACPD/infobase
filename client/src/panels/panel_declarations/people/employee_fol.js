import text from "./employee_fol.yaml";
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
const { fol } = businessConstants;

const { A11YTable } = declarative_charts;


const info_deps_by_level = {
  gov: ['orgEmployeeFol_gov_info'],
  dept: ['orgEmployeeFol_dept_info'],
};

const calculate_funcs_by_level = {
  gov: function(gov, info){
    const {orgEmployeeFol} = this.tables;

    const gov_five_year_total_head_count =_.chain(orgEmployeeFol.q().gov_grouping())
      .map(row => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.chain(fol)
      .values()
      .map(fol_type => {
        const fol_text = fol_type.text;
        const yearly_values = people_years.map(year => orgEmployeeFol.horizontal(year,false)[fol_text]);
        return {
          label: fol_text,
          data: yearly_values,
          five_year_percent: yearly_values.reduce(function(sum, val) { return sum + val; }, 0)/gov_five_year_total_head_count,
          active: true,
        };
      })
      .sortBy( d => -d3.sum(d.data) )
      .value();
  },
  dept: function(dept, info){
    const {orgEmployeeFol} = this.tables;
    return _.chain(orgEmployeeFol.q(dept).data)
      .map(row =>
        ({
          label: row.fol,
          data: people_years.map(year =>row[year]),
          five_year_percent: row.five_year_percent,
          active: true,
        })
      )
      .filter( d => d3.sum(d.data) !== 0 )
      .sortBy( d => -d3.sum(d.data) )
      .value();
  },
};


export const declare_employee_fol_panel = () => declare_panel({
  panel_key: "employee_fol",
  levels: ["gov", "dept"],
  panel_config_func: (level, panel_key) => ({
    depends_on: ['orgEmployeeFol'],
    info_deps: info_deps_by_level[level],
    calculate: calculate_funcs_by_level[level],
  
    render({calculations, footnotes, sources}){
      const { info, panel_args } = calculations;
      
      const ticks = _.map(people_years, y => `${run_template(y)}`);
      
      let required_footnotes;
      const has_suppressed_data = _.some(panel_args, graph_arg => graph_arg.label === fol.sup.text);
      if (has_suppressed_data){
        required_footnotes = footnotes;
      } else {
        required_footnotes = _.filter(
          footnotes,
          footnote => !_.some(footnote.topic_keys, key => key === "SUPPRESSED_DATA")
        );
      }

      return (
        <StdPanel
          title={text_maker("employee_fol_title")}
          {...{footnotes: required_footnotes, sources}}
        >
          <Col size={12} isText>
            <TM k={level+"_employee_fol_text"} args={info} />
          </Col>
          { !window.is_a11y_mode &&
            <Col size={12} isGraph>
              <AverageSharePie
                panel_args = {panel_args}
                label_col_header = {text_maker("FOL")}
              />
            </Col>
          }
          { !window.is_a11y_mode && level === "dept" &&
            <Col size={12} isGraph>
              <HeightClippedGraph>
                <LineBarToggleGraph 
                  {...{
                    legend_title: text_maker("FOL"),
                    bar: true,
                    graph_options: {
                      y_axis: text_maker("employees"),
                      ticks: ticks,
                      formatter: formats.big_int_raw,
                    },
                    initial_graph_mode: "bar_grouped",
                    data: panel_args,
                  }}
                />
              </HeightClippedGraph>
            </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("FOL")}
                data_col_headers = {[...ticks, text_maker("five_year_percent_header")]}
                data = {_.map(panel_args, dimension => { 
                  return {label: dimension.label, data: [...dimension.data, formats["percentage1_raw"](dimension.five_year_percent)]};
                })}
              />
            </Col>
          }
        </StdPanel>
      );
    },
  }),
});
