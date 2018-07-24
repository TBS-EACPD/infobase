import text1 from "./budget_measures_panel.yaml";
import text2 from "../../partition/budget_measures_subapp/BudgetMeasuresRoute.yaml";
import {
  formats,
  PanelGraph,
  Subject,
  businessConstants,
  util_components,
  declarative_charts,
  create_text_maker_component,
  Panel,
} from "../shared";

import { Fragment } from 'react';

const { BudgetMeasure } = Subject;
const { 
  budget_chapters,
  budget_values,
} = businessConstants;

const {
  Select,
  Format,
} = util_components;

const {
  StackedHbarChart,
  A11YTable,
} = declarative_charts;

const { text_maker, TM } = create_text_maker_component([text1,text2]);

const gov_dept_calculate_stats_common = (data) => {
  const total_funding = _.reduce(data,
    (total, budget_measure) => total + budget_measure.data.funding, 
    0
  );

  const measure_count = data.length;

  const chapter_count = _.chain(data)
    .map( budget_measure => budget_measure.chapter_key )
    .uniq()
    .value()
    .length;

  return {
    total_funding,
    measure_count,
    chapter_count,
    multiple_measures: measure_count > 1,
    multiple_chapters: chapter_count > 1,
  }
}

const crso_program_calculate = (subject, info, options) => {
  const org_id_string = subject.dept.id.toString();
  const activity_code = _.split(subject.id, '-')[1]; // Get activity code from id, since crso subject doesn't surface it directly

  const program_measures_with_data_filtered = _.chain( BudgetMeasure.get_all() )
    .filter(measure => _.indexOf( measure.orgs, org_id_string ) !== -1)
    .map( measure => ({
      ...measure,
      data: _.chain(measure.data)
        .filter( data => data.org_id === org_id_string )
        .thru( nested_data => {
          const program_allocations = nested_data[0].program_allocations;

          return {
            ...nested_data[0],
            allocated: !_.isEmpty(program_allocations) ? 
             _.chain(nested_data[0].program_allocations)
               .filter( (value, key) => key === activity_code )
               .reduce( (memo, value) => memo + value, 0)
               .value() :
              0,
          };
        })
        .value(),
    }))
    .filter(measure => measure.data.allocated !== 0)
    .value();
  
  if (!_.isEmpty(program_measures_with_data_filtered)){
    return {
      data: program_measures_with_data_filtered,
      subject,
      info: {}, // TODO, will have different info calc then gov and dept, haven't written text yet though
    };
  } else {
    return false;
  }
}

const calculate_functions = {
  gov: function(subject, info, options){
    const all_measures_with_data_rolled_up = _.chain( BudgetMeasure.get_all() )
      .map( measure => ({
        ...measure,
        data: _.chain(budget_values)
          .keys()
          .map( key => [
            key,
            _.reduce(measure.data, (total, data_row) => total + data_row[key], 0),
          ])
          .fromPairs()
          .value(),
      }))
      .sortBy(budget_measure => -budget_measure.data.funding)
      .value();

    if (!_.isEmpty(all_measures_with_data_rolled_up)){
      return {
        data: all_measures_with_data_rolled_up,
        subject,
        info: gov_dept_calculate_stats_common(all_measures_with_data_rolled_up),
      };
    } else {
      return false;
    }
  },
  dept: function(subject, info, options){
    const org_id_string = subject.id.toString();

    const org_measures_with_data_filtered = _.chain( BudgetMeasure.get_all() )
      .filter(measure => _.indexOf( measure.orgs, org_id_string ) !== -1)
      .map( measure => ({
        ...measure,
        data: _.filter( measure.data, data => data.org_id === org_id_string )[0],
      }))
      .value();
    
    if (!_.isEmpty(org_measures_with_data_filtered)){
      return {
        data: org_measures_with_data_filtered,
        subject,
        info: gov_dept_calculate_stats_common(org_measures_with_data_filtered),
      };
    } else {
      return false;
    }
  },
  program: crso_program_calculate,
  crso: crso_program_calculate,
};

const budget_measure_render = function({calculations, footnotes, sources}){

  const { graph_args } = calculations;

  return (
    <Panel
      title={text_maker("budget_measures_panel_title")}
      {...{sources,footnotes}}
    >
      <BudgetMeasureHBars graph_args = { graph_args } />
    </Panel>
  );
};


['gov', 'dept', 'program', 'crso'].forEach( level_name => new PanelGraph(
  {
    level: level_name,
    key: "budget_measures_panel",
    requires_budget_measures: true,
    footnotes: false,
    source: (subject) => [{
      html: text_maker("budget_route_title"),
      href: "#budget-measures/" + (subject.level === "gov" ? "budget-measure" : "dept"), // todo: update when new arg added to budget route
    }],
    calculate: calculate_functions[level_name],
    render: budget_measure_render,
  }
));


class BudgetMeasureHBars extends React.Component {
  constructor(props){
    super(props);

    const { 
      graph_args: {
        subject,
      },
    } = props;

    this.state = {
      selected_filter: 'all',
      selected_value: _.indexOf(["program", "crso"], subject.level) !== -1  ? 
        "allocated" : 
        'funding',
    };
  }
  render(){
    const { 
      graph_args: {
        data,
        subject,
        info,
      },
    } = this.props;

    const { 
      selected_filter,
      selected_value,
    } = this.state;

    const sorted_data = _.chain(data)
      .sortBy(budget_measure => -budget_measure.name)
      .sortBy(budget_measure => -budget_measure.data[selected_value])
      .value();

    const text_area = <div className = "frow" >
      <div className = "fcol-md-12 fcol-xs-12 medium_panel_text text">
        { subject.level === "gov" &&
          <Fragment>
            <TM k={"budget_route_top_text"} />
            <TM 
              k={"gov_budget_measures_panel_text"} 
              args={{subject, ...info}} 
            />
          </Fragment>
        }
        { subject.level === "dept" &&
          <TM
            k={"dept_budget_measures_panel_text"} 
            args={{subject, ...info}} 
          />
        }
        { _.indexOf(["program", "crso"], subject.level) !== -1 &&
          <TM
            k={"program_crso_budget_measures_panel_text"} 
            args={{subject, ...info}} 
          />
        }
      </div>
    </div>;

    if(window.is_a11y_mode){
      // TODO add other values to a11y table
      // TODO separate program level a11y table?
      return <div>
        { text_area }
        <A11YTable
          table_name = { text_maker("budget_name_header") }
          data = {_.map(sorted_data, 
            (budget_measure_item) => ({
              label: budget_measure_item.name,
              data: [
                <div key = { budget_measure_item.id + "col2" } >
                  { budget_chapters[budget_measure_item.chapter_key].text }
                </div>,
                <Format
                  key = { budget_measure_item.id + "col3" } 
                  type = "compact1" 
                  content = { budget_measure_item.data.funding } 
                />,
                <a 
                  key = { budget_measure_item.id + "col4" }
                  href={BudgetMeasure.make_budget_link(budget_measure_item.chapter_key, budget_measure_item.ref_id)}
                >
                  { text_maker("link") }
                </a>,
              ],
            })
          )}
          label_col_header = { text_maker("budget_measure") }
          data_col_headers = {[
            text_maker("budget_chapter"),
            text_maker("budget_measures_panel_title"),
            text_maker("budget_panel_a11y_link_header"),
          ]}
        />
      </div>;
    }

    const filter_options = _.chain(sorted_data)
      .map(budget_measure_item => budget_measure_item.chapter_key)
      .uniq()
      .map( chapter_key => ({
        name: budget_chapters[chapter_key].text,
        id: chapter_key,
      }))
      .sortBy( filter_option => filter_option.name )
      .thru( present_chapter_keys => _.concat(
        [{
          name: text_maker('all'),
          id: 'all',
        }],
        present_chapter_keys,
      ))
      .value();

    const value_options = _.chain(sorted_data)
      .flatMap(data => data.data)
      .reduce( (memo, data) => {
        return {
          funding: memo.funding + data.funding,
          allocated: memo.allocated + data.allocated,
          withheld: memo.withheld + data.withheld,
          remaining: memo.remaining + data.remaining,
        };
      },
      {
        funding: 0,
        allocated: 0,
        withheld: 0,
        remaining: 0,
      })
      .pickBy(value => value > 0)
      .keys()
      .map(key => ({
        id: key,
        name: budget_values[key].text,
      }))
      .value();
    
    const graph_ready_data = _.chain(sorted_data)
      .map( budget_measure_item => ({
        key: budget_measure_item.id,
        label: budget_measure_item.name,
        data: [budget_measure_item.data[selected_value]],
        chapter_key: budget_measure_item.chapter_key,
        ref_id: budget_measure_item.ref_id,
      }))
      .thru( mapped_data => {
        if (selected_filter !== 'all'){
          return _.chain(mapped_data)
            .filter(item => item.chapter_key === selected_filter )
            .map( item => ({
              ...item,
              data: [item],
            }))
            .value();
        } else {
          return _.chain(mapped_data)
            .groupBy("chapter_key")
            .map( (group, key) => ({
              key,
              label: budget_chapters[key].text,
              data: _.chain(group)
                .groupBy( measure => measure.data[0] < 0 ? "__negative_valued" : "__positive_valued")
                .map( (group, key) => ({
                  key: group[0].chapter_key + key,
                  label: key,
                  data: _.reduce(group, (total, item) => total + item.data[0], 0),
                }))
                .value(),
              chapter_key: key,
            }))
            .value();
        }
      })
      .value();
    
    const names_of_measures_with_negative_values = selected_filter !== 'all' ? 
      _.chain(sorted_data)
        .filter( measure => measure.data.values < 0 )
        .map( measure_with_negative_values => measure_with_negative_values.name )
        .value() :
      ["__negative_valued"];
    
    const bar_colors = (item_label) => {
      if ( _.indexOf(names_of_measures_with_negative_values, item_label) !== -1 ){
        return "#ff7e0f";
      } else {
        return "#1f77b4";
      }
    }
    
    const dropdown_padding = "0px 15px";

    return <div>
      { text_area }
      <div className = "frow">
        <div className = "fcol-md-12" style = {{ width: "100%" }}>
          <div className = 'centerer'>
            { _.indexOf(["program", "crso"], subject.level) === -1 &&
              <label style = {{padding: dropdown_padding}}>
                <TM k="budget_panel_select_value" />
                <Select 
                  selected = {selected_value}
                  options = {_.map(value_options, 
                    ({name, id}) => ({ 
                      id,
                      display: name,
                    })
                  )}
                  onSelect = { id => this.setState({selected_value: id}) }
                  style = {{
                    display: 'block',
                    margin: '10px auto',
                  }}
                  className = "form-control"
                />
              </label>
            }
            <label style = {{padding: dropdown_padding}}>
              <TM k="budget_panel_filter_by_chapter" />
              <Select 
                selected = {selected_filter}
                options = {_.map(filter_options, 
                  ({name, id}) => ({ 
                    id,
                    display: name,
                  })
                )}
                onSelect = { id => this.setState({selected_filter: id}) }
                style = {{
                  display: 'block',
                  margin: '10px auto',
                }}
                className = "form-control"
              />
            </label>
          </div>
          <div
            style={{
              position: "absolute",
              fontWeight: "700",
              fontSize: "12px",
              marginLeft: "20px",
            }}
          >
            <TM 
              k={
                selected_filter === 'all' ? 
                "budget_chapter" : 
                "budget_measure"
              } 
            />
          </div>
          <div 
            style={{
              maxHeight: '700px',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <StackedHbarChart
              font_size="12px"
              bar_height={60} 
              data = {graph_ready_data}
              formater = {formats.compact1}
              colors = {bar_colors}
              bar_label_formater = { 
                ({ label, chapter_key, ref_id }) => 
                  `<a href="${BudgetMeasure.make_budget_link(chapter_key, ref_id)}">${label}</a>`
              }
            />
          </div>
        </div>
      </div> 
    </div>;
  }
}
