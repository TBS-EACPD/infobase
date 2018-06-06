import text from "./employee_fol.yaml"
import {
  formats,
  run_template,
  PanelGraph,
  PplSharePie,
  HeightClippedGraphWithLegend,
  business_constants,
  years,
  create_text_maker,
  TM as StdTM,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared"; 

const text_maker = create_text_maker(text);
const TM = props => <StdTM tmf={text_maker} {...props} />;

const { people_years } = years;
const { fol } = business_constants;

const {
  A11YTable,
} = declarative_charts;


const info_deps_by_level = {
  gov: ['table303_gov_info'],
  dept: ['table303_dept_info'],
};

const calculate_funcs_by_level = {
  gov: function(gov, info){
    const {table303} = this.tables;

    const gov_five_year_total_head_count =_.chain(table303.q().gov_grouping())
      .map(row => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.values(fol)
      .map(fol_type => {
        const fol_text = fol_type.text;
        const yearly_values = people_years.map(year => table303.horizontal(year,false)[fol_text]);
        return {
          label: fol_text,
          data: yearly_values,
          five_year_percent: yearly_values.reduce(function(sum, val) { return sum + val }, 0)/gov_five_year_total_head_count,
          active: true,
        };
      });
  },
  dept: function(dept, info){
    const {table303} = this.tables;
    return table303.q(dept).data
      .map(row =>
        ({
          label: row.fol,
          data: people_years.map(year =>row[year]),
          five_year_percent: row.five_year_percent,
          active: true,
        })
      )
      .filter(d => d3.sum(d.data) !== 0 );
  },
};

["gov", "dept"].map(
  level => new PanelGraph({
    key: "employee_fol",
    level: level,
    depends_on: ['table303'],
    info_deps: info_deps_by_level[level],
    calculate: calculate_funcs_by_level[level],
  
    render({calculations, footnotes, sources}){
      const { info, graph_args } = calculations;
      
      const ticks = _.map(people_years, y => `${run_template(y)}`);
      
      return (
        <StdPanel
          title={text_maker("employee_fol_title")}
          {...{footnotes, sources}}
        >
          <Col size={5} isText>
            <TM k={level+"_employee_fol_text"} args={info} />
          </Col>
          <Col size={7} isGraph>
            { !window.is_a11y_mode &&
              <PplSharePie
                graph_args = {graph_args}
                label_col_header = {text_maker("FOL")}
              />
            }
          </Col>
          <Col size={12} isGraph>
            { !window.is_a11y_mode && level === "dept" &&
              <HeightClippedGraphWithLegend
                create_graph_with_legend_options = {{
                  legend_col_full_size: 4,
                  graph_col_full_size: 8,
                  graph_col_class: "height-clipped-bar-area",
                  legend_class: 'fcol-sm-11 fcol-md-11',
                  y_axis: text_maker("employees"),
                  ticks: ticks,
                  bar: true,
                  yaxis_formatter: formats["big_int_real_raw"],
                  legend_title: text_maker("FOL"),
                  get_data: _.property("data"),
                  data: graph_args,
                }}
              />
            }
          </Col>
          <Col size={12} isGraph>
            { window.is_a11y_mode &&
              <A11YTable
                label_col_header = {text_maker("FOL")}
                data_col_headers = {[...ticks, text_maker("five_year_percent_header")]}
                data = {_.map(graph_args, dimension => { 
                  return {label: dimension.label, data: [...dimension.data, formats["percentage1_raw"](dimension.five_year_percent)]};
                })}
              />
            }
          </Col>
        </StdPanel>
      );
    },
  })
);
