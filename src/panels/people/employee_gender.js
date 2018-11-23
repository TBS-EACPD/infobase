import text from "./employee_gender.yaml"
import {
  formats,
  run_template,
  PanelGraph,
  PplSharePie,
  HeightClippedLineBarToggleGraph,
  businessConstants,
  years,
  create_text_maker_component,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared"; 

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = years;
const { gender } = businessConstants;

const { A11YTable } = declarative_charts;


const info_deps_by_level = {
  gov: ['table302_gov_info'],
  dept: ['table302_dept_info'],
};

const calculate_funcs_by_level = {
  gov: function(gov, info){
    const {table302} = this.tables;
    
    const gov_five_year_total_head_count =_.chain(table302.q().gov_grouping())
      .map(row => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.chain(gender)
      .values()
      .map(gender_type => {
        const gender_text = gender_type.text;
        const yearly_values = people_years.map(year => table302.horizontal(year,false)[gender_text]);
        return {
          label: gender_text,
          data: yearly_values,
          five_year_percent: yearly_values.reduce(function(sum, val) { return sum + val }, 0)/gov_five_year_total_head_count,
          active: true,
        };
      })
      .sortBy( d => -d3.sum(d.data) )
      .value();
  },
  dept: function(dept, info){
    const {table302} = this.tables;
    return _.chain(table302.q(dept).data)
      .map(row =>
        ({
          label: row.gender,
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

["gov", "dept"].map(
  level => new PanelGraph({
    key: "employee_gender",
    level: level,
    depends_on: ['table302'],
    info_deps: info_deps_by_level[level],
    calculate: calculate_funcs_by_level[level],
  
    render({calculations, footnotes, sources}){
      const { info, graph_args } = calculations;
      
      const ticks = _.map(people_years, y => `${run_template(y)}`);
      
      let required_footnotes;
      const has_suppressed_data = _.some(graph_args, graph_arg => graph_arg.label === gender.sup.text);
      if (has_suppressed_data){
        required_footnotes = footnotes;
      } else {
        required_footnotes = _.filter(
          footnotes,
          footnote => !_.some(footnote.topic_keys, key => key === "SUPPRESSED_DATA")
        )
      }

      return (
        <StdPanel
          title={text_maker("employee_gender_title")}
          {...{footnotes: required_footnotes, sources}}
        >
          <Col size={12} isText>
            <TM k={level+"_employee_gender_text"} args={info} />
          </Col>
          { !window.is_a11y_mode &&
            <Col size={12} isGraph>
              <PplSharePie
                graph_args = {graph_args}
                label_col_header = {text_maker("employee_gender")}
              />
            </Col>
          }
          { !window.is_a11y_mode && level === "dept" &&
            <Col size={12} isGraph>
              <HeightClippedLineBarToggleGraph
                graph_props = {{
                  legend_title: text_maker("employee_gender"),
                  bar: true,
                  graph_options: {
                    y_axis: text_maker("employees"),
                    ticks: ticks,
                    formater: formats.big_int_real_raw,
                  },
                  initial_graph_mode: "bar_grouped",
                  data: graph_args,
                }}
              />
            </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("employee_gender")}
                data_col_headers = {[...ticks, text_maker("five_year_percent_header")]}
                data = {_.map(graph_args, dimension => { 
                  return {label: dimension.label, data: [...dimension.data, formats["percentage1_raw"](dimension.five_year_percent)]};
                })}
              />
            </Col>
          }
        </StdPanel>
      );
    },
  })
);
