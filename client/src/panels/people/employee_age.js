import text from "./employee_age.yaml"
import {
  formats,
  run_template,
  Subject,
  PanelGraph,
  businessConstants,
  years,
  TabbedContent,
  create_text_maker_component,
  declarative_charts,
  StdPanel,
  Col,
  LineBarToggleGraph,
} from "../shared"; 

const { text_maker, TM } = create_text_maker_component(text);

const { people_years } = years;
const { compact_age_groups } = businessConstants;

const { A11YTable } = declarative_charts;


const info_deps_by_level = {
  gov: [
    'orgEmployeeAgeGroup_gov_info',
    'orgEmployeeAvgAge_gov_info',
  ],
  dept: [
    'orgEmployeeAgeGroup_dept_info',
    'orgEmployeeAgeGroup_gov_info',
    'orgEmployeeAvgAge_dept_info',
    'orgEmployeeAvgAge_gov_info',
  ],
};

const calculate_funcs_by_level = {
  gov: function(gov, info){
    const {orgEmployeeAgeGroup} = this.tables;
    const {orgEmployeeAvgAge} = this.tables;
    
    const avg_age = [{
      label: text_maker("fps"),
      data: people_years.map(year => orgEmployeeAvgAge.GOC[0][year]),
      active: true,
    }];
    
    const gov_five_year_total_head_count =_.chain(orgEmployeeAgeGroup.q().gov_grouping())
      .map(row => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    const age_group = compact_age_groups.map(age_range => {
      const yearly_values = people_years.map( year => orgEmployeeAgeGroup.horizontal(year,false)[age_range]);
      return {
        label: age_range,
        active: true,
        data: yearly_values,
        five_year_percent: yearly_values.reduce(function(sum, val) { return sum + val;}, 0)/gov_five_year_total_head_count,
      };
    })
    
    return {
      avg_age: avg_age,
      age_group: age_group,
    };
  },
  dept: function(dept){
    const {orgEmployeeAgeGroup} = this.tables;
    const {orgEmployeeAvgAge} = this.tables;
    const series = orgEmployeeAgeGroup.q(dept).high_level_rows();
    
    const avg_age = _.chain(orgEmployeeAvgAge.q(dept).data)
      .map(row => ({
        label: Subject.Dept.lookup(row.dept).fancy_name,
        data: people_years.map(year =>row[year]),
        active: true,
      }))
      .filter(d => d3.sum(d.data) !== 0)
      .concat({
        label: text_maker("fps"),
        data: people_years.map(year => orgEmployeeAvgAge.GOC[0][year]),
        active: true,
      })
      .sortBy( d => -d3.sum(d.data) )
      .value();
    
    const dept_five_year_total_head_count = _.chain(series)
      .map(row => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    const age_group = _.chain(series)
      .map(row => {
        const label = _.head(row);
        const data = _.drop(row);
        return {
          label,
          data,
          five_year_percent: d3.sum(data)/dept_five_year_total_head_count,
          active: true,
        };
      })
      .filter(d => d3.sum(d.data) !== 0)
      .value();
    
    return {
      avg_age: avg_age,
      age_group: age_group,
    };
  },
};

["gov", "dept"].map(
  level => new PanelGraph({
    key: "employee_age",
    level: level,
    depends_on: [
      'orgEmployeeAgeGroup', 
      'orgEmployeeAvgAge',
    ],
    info_deps: info_deps_by_level[level],
    calculate: calculate_funcs_by_level[level],
  
    render({calculations, footnotes, sources}){
      const { info, graph_args } = calculations;
      
      const ticks = _.map(people_years, y => `${run_template(y)}`);
      
      // Options for LineBarToggleGraph React components
      const age_group_options = {
        legend_title: text_maker("age_group"),
        bar: true,
        graph_options: {
          ticks: ticks,
          y_axis: text_maker("employees"),
          formater: formats.big_int_real_raw,
        },
        initial_graph_mode: "bar_grouped",
        data: graph_args.age_group,
      };
      const avg_age_options = {
        legend_title: text_maker("legend"),
        bar: false,
        graph_options: {
          ticks: ticks,
          y_axis: text_maker("avgage"),
          formater: formats.int,
        },
        disable_toggle: true,
        initial_graph_mode: "line",
        data: graph_args.avg_age,
      };
      
      return (
        <StdPanel
          title={text_maker("employee_age_title")}
          {...{footnotes, sources}}
        >
          <Col size={12} isText>
            <TM k={level+"_employee_age_text"} args={info} />
          </Col>
          { !window.is_a11y_mode &&
            <Col size={12} isGraph extraClasses="zero-padding"> 
              <TabbedContent
                tabKeys={["age_group", "avgage"]}
                tabLabels={{
                  age_group: text_maker("age_group"),
                  avgage: text_maker("avgage"),
                }}
                tabPaneContents={{
                  age_group: (
                    <div id={"emp_age_tab_pane"}>
                      <LineBarToggleGraph {...age_group_options} />
                      <div className='clearfix'></div>
                    </div>
                  ), 
                  avgage: (
                    <div id={"emp_age_tab_pane"}>
                      <LineBarToggleGraph {...avg_age_options} />
                      <div className='clearfix'></div>
                    </div>
                  ),
                }}
              />
            </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("age_group")}
                data_col_headers = {[...ticks, text_maker("five_year_percent_header")]}
                data = {_.map(graph_args.age_group, dimension => { 
                  return {label: dimension.label, data: [...dimension.data, formats["percentage1_raw"](dimension.five_year_percent)]} 
                })}
              />
            </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("avgage")}
                data_col_headers = {ticks}
                data = {graph_args.avg_age}
              />
            </Col>
          }
        </StdPanel>
      );
    },
  })
);
