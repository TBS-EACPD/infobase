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

import { infograph_href_template } from '../../link_utils.js';

const { 
  BudgetMeasure,
  Dept,
  Program,
  CRSO,
} = Subject;
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
  GraphLegend,
} = declarative_charts;

const { text_maker, TM } = create_text_maker_component([text1,text2]);

const gov_dept_calculate_stats_common = (data) => {
  const total_funding = _.reduce(data,
    (total, budget_measure) => total + budget_measure.measure_data.funding, 
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

  const program_measures_with_data_filtered = _.chain( BudgetMeasure.get_all() )
    .filter(measure => _.indexOf( measure.orgs, org_id_string ) !== -1)
    .map( measure => ({
      ...measure,
      measure_data: _.chain(measure.data)
        .filter( data => data.org_id === org_id_string )
        .thru( nested_data => {
          const program_allocations = nested_data[0].program_allocations;

          return {
            ...nested_data[0],
            allocated: !_.isEmpty(program_allocations) ? 
             _.chain(nested_data[0].program_allocations)
               .filter( (value, key) => key === subject.id )
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
      info: {}, // TODO, will have different info calc than gov and dept, haven't written text yet though
    };
  } else {
    return false;
  }
}

const calculate_functions = {
  gov: function(subject, info, options){
    const all_measures_with_data_rolled_up = _.map(
      BudgetMeasure.get_all(), 
      measure => ({
        ...measure,
        measure_data: _.chain(budget_values)
          .keys()
          .map( key => [
            key,
            _.reduce(measure.data, (total, data_row) => total + data_row[key], 0),
          ])
          .fromPairs()
          .assign({
            measure_id: measure.id,
          })
          .value(),
      })
    );

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
        measure_data: _.filter( measure.data, data => data.org_id === org_id_string )[0],
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
      href: "#budget-measures/" + (subject.level === "gov" ? "budget-measure" : "dept") + "/overview",
    }],
    calculate: calculate_functions[level_name],
    render: budget_measure_render,
  }
));


const treatAsProgram = (subject) => {
  return _.indexOf(["program", "crso"], subject.level) !== -1;
}
const get_grouping_options = (subject) =>{
  const common_options = [
    {
      name: text_maker('budget_measures'),
      id: 'measures',
    },
    {
      name: text_maker('budget_chapters'),
      id: 'chapters',
    },
  ];

  if (subject.level === "gov"){
    return [
      ...common_options,
      {
        name: text_maker('orgs'),
        id: 'orgs',
      },
    ];
  } else if (subject.level === "dept"){
    return [
      ...common_options,
      {
        name: text_maker('programs'),
        id: 'programs',
      },
    ];
  } else {
    return common_options;
  }
}
class BudgetMeasureHBars extends React.Component {
  constructor(props){
    super(props);

    const { 
      graph_args: {
        subject,
      },
    } = props;

    const grouping_options = get_grouping_options(subject);

    this.state = {
      grouping_options, 
      selected_grouping: grouping_options[0].id,
      value_options: {},
      selected_value: treatAsProgram(subject) ? 
        "allocated" : 
        'funding_overview',
    };
  }
  static getDerivedStateFromProps(props, state){
    const { 
      graph_args: {
        subject,
        data,
      },
    } = props;

    const {
      selected_grouping,
      selected_value,
    } = state;

    const value_options = treatAsProgram(subject) || selected_grouping === "programs" ? 
      [{
        id: "allocated",
        name: budget_values.allocated.text,
      }] :
      _.chain(data)
        .flatMap(data => data.measure_data)
        .reduce( 
          (memo, measure_data) => _.chain(budget_values)
            .keys()
            .map(key => [ key, memo[key] + measure_data[key] ])
            .fromPairs()
            .value(),
          _.chain(budget_values)
            .keys()
            .map(key => [key, 0])
            .fromPairs()
            .value()
        )
        .pickBy(value => value !== 0)
        .keys()
        .map(key => ({
          id: key,
          name: budget_values[key].text,
        }))
        .thru(value_options => [
          {
            id: "funding_overview",
            name: text_maker("funding_overview"),
          },
          ...value_options,
        ])
        .value();

    const valid_selected_value = _.filter(value_options, value_option => value_option.id === selected_value).length === 1 ?
      selected_value :
      value_options[0].id;

    return {
      selected_value: valid_selected_value,
      value_options,
    }
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
      selected_grouping,
      selected_value,
      grouping_options,
      value_options,
    } = this.state;

    const biv_values = _.chain(budget_values)
      .keys()
      .filter(key => key !== "funding")
      .sortBy()
      .value();

    const label_value_indicator = (value) => value < 0 ? "__negative_valued" : "__positive_valued";
    const strip_value_indicator_from_label = (label) => label
      .replace("__negative_valued", "")
      .replace("__positive_valued", "");

    let data_by_selected_group;
    if (selected_grouping === 'measures'){
      data_by_selected_group = _.map(data, 
        budget_measure_item => ({
          key: budget_measure_item.id,
          label: budget_measure_item.name,
          link: BudgetMeasure.make_budget_link(budget_measure_item.chapter_key, budget_measure_item.ref_id),
          is_link_out: true,
          data: budget_measure_item.measure_data,
        })
      );
    } else if (selected_grouping === 'chapters'){
      data_by_selected_group = _.chain(data)
        .groupBy("chapter_key")
        .map(
          (chapter_group, chapter_key) => ({
            key: chapter_key,
            label: budget_chapters[chapter_key].text,
            chapter_key: chapter_key,
            link: BudgetMeasure.make_budget_link(chapter_key, false),
            is_link_out: true,
            data: _.reduce(
              chapter_group,
              (memo, measure) => _.mapValues(
                memo,
                (value, key) => value + measure.measure_data[key]
              ),
              _.chain(budget_values)
                .keys()
                .map(value_key => [value_key, 0])
                .fromPairs()
                .value()
	          ),  
          })
        )
        .value();
    } else if (selected_grouping === 'orgs'){
      data_by_selected_group = _.chain(data)
        .flatMap( measure => measure.data)
        .groupBy("org_id")
        .map(
          (org_group, org_id) => {
            const dept = Dept.lookup(org_id);
            if ( _.isUndefined(dept) ){
              return false; // fake dept code case, "to be allocated" funds etc.
            } else {
              return {
                key: org_id,
                label: dept.name,
                link: infograph_href_template(dept, "financial"),
                data: _.reduce(
                  org_group,
                  (memo, measure_row) => _.mapValues(
                    memo,
                    (value, key) => value + measure_row[key]
                  ),
                  _.chain(budget_values)
                    .keys()
                    .map(value_key => [value_key, 0])
                    .fromPairs()
                    .value()
	              ),  
              };
            }
          }
        )
        .filter()
        .value();
    } else if (selected_grouping === 'programs'){
      data_by_selected_group =_.chain(data)
        .flatMap( measure => _.map(measure.data, "program_allocations") )
        .reduce(
          (memo, program_allocations) => {
            _.each(
              program_allocations, 
              (program_allocation, program_id) => {
                const memo_value = memo[program_id] || 0;
                memo[program_id] = memo_value + program_allocation;
              }
            )
            return memo;
          },
          {},
        )
        .map(
          (program_allocation, program_id) => {
            const program = Program.lookup(program_id) || CRSO.lookup(program_id);
            return {
              key: program_id,
              label: program.name,
              link: infograph_href_template(program, "financial"),
              data: {"allocated": program_allocation},
            };
          }
        )
        .value();
    }
    
    let graph_ready_data;
    if (selected_value === 'funding_overview'){
      graph_ready_data = _.map(data_by_selected_group, item => {
        const modified_data = _.chain(biv_values)
          .flatMap( key => 
            _.chain([item.data])
              .map(data => {
                const value = data[key];
                return [
                  key + label_value_indicator(value), 
                  value,
                ]
              })
              .filter( pair => !_.isUndefined(pair[1]) )
              .value()
          )
          .fromPairs()
          .pickBy(value => value !== 0)
          .map( (value, key) => ({
            ...item,
            label: strip_value_indicator_from_label(key),
            data: [value],
          }))
          .sortBy("label")
          .value();
        const modified_item = {
          ...item,
          data: modified_data,
        };
        return modified_item;
      });
    } else {
      graph_ready_data = _.chain(data_by_selected_group)
        .map( item => ({
          ...item,
          data: [{
            ...item,
            label: item.label + label_value_indicator(item.data[selected_value]),
            data: [ item.data[selected_value] ],
          }],
        }))
        .value();
    }
    
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
        { treatAsProgram(subject) &&
          <TM
            k={"program_crso_budget_measures_panel_text"} 
            args={{subject, ...info}} 
          />
        }
      </div>
    </div>;
  
    if(window.is_a11y_mode){
      return <div>
        { text_area }
        <A11YTable
          table_name = { text_maker("budget_name_header") }
          data = {_.map(data, 
            (budget_measure_item) => ({
              label: budget_measure_item.name,
              data: _.filter([
                <div key = { budget_measure_item.id + "col2" } >
                  { budget_chapters[budget_measure_item.chapter_key].text }
                </div>,
                !treatAsProgram(subject) && <Format
                  key = { budget_measure_item.id + "col3" } 
                  type = "compact1" 
                  content = { budget_measure_item.measure_data.funding } 
                />,
                <Format
                  key = { budget_measure_item.id + (treatAsProgram(subject) ? "col3" : "col4") } 
                  type = "compact1" 
                  content = { budget_measure_item.measure_data.allocated } 
                />,
                !treatAsProgram(subject) && <Format
                  key = { budget_measure_item.id + "col5" } 
                  type = "compact1" 
                  content = { budget_measure_item.measure_data.withheld } 
                />,
                !treatAsProgram(subject) && <Format
                  key = { budget_measure_item.id + "col6" } 
                  type = "compact1" 
                  content = { budget_measure_item.measure_data.remaining } 
                />,
                <a 
                  key = { budget_measure_item.id + (treatAsProgram(subject) ? "col4" : "col7") }
                  href={BudgetMeasure.make_budget_link(budget_measure_item.chapter_key, budget_measure_item.ref_id)}
                >
                  { text_maker("link") }
                </a>,
              ]),
            })
          )}
          label_col_header = { text_maker("budget_measure") }
          data_col_headers = {_.filter([
            text_maker("budget_chapter"),
            !treatAsProgram(subject) && budget_values.funding.text,
            budget_values.allocated.text,
            !treatAsProgram(subject) && budget_values.withheld.text,
            !treatAsProgram(subject) && budget_values.remaining.text,
            text_maker("budget_panel_a11y_link_header"),
          ])}
        />
      </div>;
    } else {
      const biv_value_colors = infobase_colors(biv_values);
      const bar_colors = (data_label) => {
        if (selected_value === 'funding_overview'){
          return biv_value_colors(data_label);
        } else {
          if ( data_label.includes("__negative_valued") ){
            return "#ff7e0f";
          } else {
            return "#1f77b4";
          }
        }
      }
      const dropdown_padding = "0px 15px";
  
      return <div>
        { text_area }
        <div className = "frow">
          <div className = "fcol-md-12" style = {{ width: "100%" }}>
            <div className = 'centerer'>
              <label style = {{padding: dropdown_padding, textAlign: "center"}}>
                <TM k="budget_panel_group_by" />
                <Select 
                  selected = {selected_grouping}
                  options = {_.map(grouping_options, 
                    ({name, id}) => ({
                      id,
                      display: name,
                    })
                  )}
                  onSelect = { id => this.setState({selected_grouping: id}) }
                  style = {{
                    display: 'block',
                    margin: '10px auto',
                  }}
                  className = "form-control"
                />
              </label>
              <label style = {{padding: dropdown_padding, textAlign: "center"}}>
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
            </div>
            <div className = 'centerer'>
              { selected_value === 'funding_overview' &&
                <GraphLegend
                  isHorizontal = {true}
                  items = {
                    _.map(biv_values, biv_value => ({
                      id: biv_value,
                      label: budget_values[biv_value].text,
                      color: biv_value_colors(biv_value),
                      active: true,
                    }))
                  }
                />
              }
            </div>
            <div
              style={{
                position: "absolute",
                fontWeight: "700",
                fontSize: "12px",
                marginLeft: "20px",
              }}
            >
              <span>
                { 
                  _.chain(grouping_options)
                    .filter(option => option.id === selected_grouping)
                    .thru(nested_option => nested_option[0].name)
                    .value()
                }
              </span>
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
                  ({ label, link, is_link_out}) => {
                    return `<a href="${link}" target="${is_link_out ? "_blank" : "_self"}">${label}</a>`;
                  }
                }
              />
            </div>
          </div>
        </div> 
      </div>;
    }
  }
}
