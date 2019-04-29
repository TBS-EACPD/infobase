import "./budget_measures_panel.scss";
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

import { ensure_loaded } from '../../core/lazy_loader.js';

import { infograph_href_template } from '../../link_utils.js';

import { Fragment } from 'react';

const { 
  BudgetMeasure,
  Dept,
  Program,
  CRSO,
} = Subject;
const { budget_years } = BudgetMeasure;
const { 
  budget_chapters,
  budget_values,
} = businessConstants;

const {
  Select,
  Format,
  TabbedControls,
  SpinnerWrapper,
} = util_components;

const {
  StackedHbarChart,
  A11YTable,
  GraphLegend,
} = declarative_charts;

const { text_maker, TM } = create_text_maker_component([text1,text2]);

const calculate_stats_common = (data) => {
  const total_funding = _.reduce(data,
    (total, budget_measure) => total + budget_measure.measure_data.funding, 
    0
  );

  const total_allocated = _.reduce(data,
    (total, budget_measure) => total + budget_measure.measure_data.allocated, 
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
    total_allocated,
    measure_count,
    chapter_count,
    multiple_measures: measure_count > 1,
    multiple_chapters: chapter_count > 1,
  }
}

const crso_program_calculate = (subject, info, options, years_with_data) => {
  const org_id_string = subject.dept.id.toString();
  
  const get_program_measures_with_data_filtered = (year) => _.chain( BudgetMeasure.get_all() )
    .filter(measure => _.indexOf( measure.orgs, org_id_string ) !== -1 && measure.year === year)
    .map( measure => 
      ({
        ...measure,
        measure_data: _.chain(measure.data)
          .filter( data => data.org_id === org_id_string )
          .thru( ([program_allocations]) => program_allocations )
          .value(),
      })
    )
    .filter(measure => measure.measure_data.allocated !== 0)
    .value();

  return {
    years_with_data,
    get_data: get_program_measures_with_data_filtered,
    get_info: calculate_stats_common,
    subject,
  };
}

const calculate_functions = {
  gov: function(subject, info, options, years_with_data){
    const get_all_measures_with_data_rolled_up = (year) => _.chain( BudgetMeasure.get_all() )
      .filter( measure => measure.year === year)
      .map( 
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
      )
      .value();

    return {
      years_with_data,
      get_data: get_all_measures_with_data_rolled_up,
      get_info: calculate_stats_common,
      subject,
    };
  },
  dept: function(subject, info, options, years_with_data){
    const org_id_string = subject.id.toString();

    const get_org_measures_with_data_filtered = (year) => _.chain( BudgetMeasure.get_all() )
      .filter(measure => _.indexOf( measure.orgs, org_id_string ) !== -1 && measure.year === year)
      .map( measure => ({
        ...measure,
        measure_data: _.filter( measure.data, data => data.org_id === org_id_string )[0],
      }))
      .value();
    
    return {
      years_with_data,
      get_data: get_org_measures_with_data_filtered,
      get_info: calculate_stats_common,
      subject,
    };
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
      <BudgetMeasurePanel graph_args = { graph_args } />
    </Panel>
  );
};


['gov', 'dept', 'program', 'crso'].forEach( level_name => new PanelGraph(
  {
    level: level_name,
    key: "budget_measures_panel",
    requires_has_budget_measures: true,
    footnotes: false,
    source: (subject) => [{
      html: text_maker("budget_route_title"),
      href: "#budget-tracker/budget-measure/overview",
    }],
    calculate: (subject, info, options) => {
      const years_with_data = level_name === "gov" ?
        budget_years :
        _.filter(
          budget_years,
          year => subject.has_data(`budget${year}_data`)
        );

      return !_.isEmpty(years_with_data) && calculate_functions[level_name](subject, info, options, years_with_data);
    },
    render: budget_measure_render,
  }
));


const treatAsProgram = (subject) => _.indexOf(["program", "crso"], subject.level) !== -1;
const get_grouping_options = (subject, data) =>{
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
    const has_allocation_data = _.chain(data)
      .flatMap(budget_measure => budget_measure.measure_data)
      .filter(data => +data.org_id === subject.id)
      .some(data => data.allocated !== 0)
      .value();

    if (has_allocation_data){
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
  } else {
    return common_options;
  }
}

class BudgetMeasurePanel extends React.Component {
  constructor(props){
    super(props);
    const { 
      graph_args: {
        years_with_data,
      },
    } = props;

    this.state = {
      years_with_data,
      selected_year: _.last(years_with_data),
      loading: true,
    }
  }
  mountAndUpdate(){
    const { 
      graph_args: {
        subject,
      },
    } = this.props;

    const {
      loading,
      selected_year,
    } = this.state;

    if (loading){
      ensure_loaded({
        subject,
        budget_measures: true,
        budget_years: [selected_year],
      })
        .then( () => this.setState({loading: false}) );
    }
  }
  componentDidMount(){ this.mountAndUpdate() }
  componentDidUpdate(){ this.mountAndUpdate() }
  render(){
    const { graph_args } = this.props;

    const {
      years_with_data,
      selected_year,
      loading,
    } = this.state;

    const inner_content = (
      <Fragment>
        { loading &&
          <div style={{position: "relative", height: "80px", marginBottom: "-10px"}}>
            <SpinnerWrapper config_name={"sub_route"} />
          </div>
        }
        { !loading &&
          <BudgetMeasureHBars graph_args={ graph_args } selected_year={ selected_year } />
        }
      </Fragment>
    );

    if ( years_with_data.length === 1) {
      return inner_content;
    }

    return (
      <div className="tabbed-content">
        <TabbedControls
          tab_callback={ (year) => this.setState({loading: true, selected_year: year}) }
          tab_options={
            _.map(
              years_with_data,
              (year) => ({
                key: year,
                label: selected_year, // TODO
                is_open: selected_year === year,
              })
            )
          }
        />
        <div className="tabbed-content__pane">
          {inner_content}
        </div>
      </div>
    );
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

    this.state = {
      grouping_options: {}, 
      selected_grouping: false,
      value_options: {},
      selected_value: treatAsProgram(subject) ? 
        "allocated" : 
        'funding_overview',
    };
  }
  static getDerivedStateFromProps(props, state){
    const { 
      graph_args: {
        get_data,
        get_info,
        subject,
      },
      selected_year,
    } = props;

    const {
      selected_grouping,
      selected_value,
    } = state; 

    const data = get_data(selected_year);
    const info = get_info(data);
  
    const grouping_options = get_grouping_options(subject, data);

    const valid_selected_grouping = selected_grouping || grouping_options[0].id;

    const value_options = treatAsProgram(subject) || valid_selected_grouping === "programs" ? 
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

    const valid_selected_value = valid_selected_grouping === "programs" ?
      selected_value : // don't update value state when switching to programs grouping, so that value isn't forced to allocated when users switch back to other groupings
      _.filter(value_options, value_option => value_option.id === selected_value).length === 1 ?
        selected_value :
        value_options[0].id;

    return {
      data,
      info,
      grouping_options,
      selected_grouping: valid_selected_grouping,
      selected_value: valid_selected_value,
      value_options,
    };
  }
  render(){
    const { 
      graph_args: {
        subject,
      },
      selected_year,
    } = this.props;

    const {
      selected_grouping,
      selected_value,
      grouping_options,
      value_options,
      data,
      info,
    } = this.state;

    const effective_selected_value = selected_grouping === "programs" ?
      'allocated' :
      selected_value;

    const biv_values = _.chain(budget_values)
      .keys()
      .filter(key => key !== "funding")
      .sortBy()
      .value();

    const label_value_indicator = (value) => value < 0 ? "__negative_valued" : "__positive_valued";
    const strip_value_indicator_from_label = (label) => label
      .replace("__negative_valued", "")
      .replace("__positive_valued", "");
      
    const get_org_budget_data_from_all_measure_data = (data) => {
      return _.chain(data)
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
                href: infograph_href_template(dept, "financial"),
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
    };
    const get_program_allocation_data_from_dept_data = (data) => {
      return _.chain(data)
        .flatMap( measure => _.chain(measure.data)
          .filter(measure_row => +measure_row.org_id === subject.id)
          .map("program_allocations")
          .value()
        )
        .reduce(
          (memo, program_allocations) => {
            _.each(
              program_allocations, 
              ({subject_id, allocated}) => {
                const memo_value = memo[subject_id] || 0;
                memo[subject_id] = memo_value + allocated;
              }
            )
            return memo;
          },
          {},
        )
        .map(
          (program_allocation, program_id) => {
            const program = Program.lookup(program_id) || CRSO.lookup(program_id);

            if ( !_.isUndefined(program) ){
              return {
                key: program_id,
                label: program.name,
                href: infograph_href_template(program, "financial"),
                data: {"allocated": program_allocation},
              };
            } else {
                window.is_dev && console.warn(`Budget panel: missing program ${program_id}`); // eslint-disable-line

              return {
                key: program_id,
                label: program_id,
                href: false,
                data: {"allocated": program_allocation},
              };
            }
          }
        )
        .value();
    };

    let data_by_selected_group;
    if (selected_grouping === 'measures'){
      data_by_selected_group = _.map(data, 
        budget_measure_item => ({
          key: budget_measure_item.id,
          label: budget_measure_item.name,
          href: BudgetMeasure.make_budget_link(budget_measure_item.chapter_key, budget_measure_item.ref_id),
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
            href: BudgetMeasure.make_budget_link(chapter_key, false),
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
      data_by_selected_group = get_org_budget_data_from_all_measure_data(data);
    } else if (selected_grouping === 'programs'){
      data_by_selected_group = get_program_allocation_data_from_dept_data(data);
    }
      
    let graph_ready_data;
    if (effective_selected_value === 'funding_overview'){
      graph_ready_data = _.chain(data_by_selected_group)
        .map(item => {
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
        })
        .filter( item => _.reduce(item.data, (memo, data_item) => memo + data_item.data[0], 0) !== 0 )
        .value();
    } else {
      graph_ready_data = _.chain(data_by_selected_group)
        .map( item => ({
          ...item,
          data: [{
            ...item,
            label: item.label + label_value_indicator(item.data[effective_selected_value]),
            data: [ item.data[effective_selected_value] ],
          }],
        }))
        .filter( item => _.reduce(item.data, (memo, data_item) => memo + data_item.data[0], 0) !== 0 )
        .value();
    }
      
    const text_area = <div className = "frow" >
      <div className = "fcol-md-12 fcol-xs-12 medium_panel_text text">
        { subject.level === "gov" &&
            <TM 
              k={"gov_budget_measures_panel_text"} 
              args={{subject, ...info, year: selected_year}} 
            />
        }
        { subject.level === "dept" &&
            <TM
              k={"dept_budget_measures_panel_text"} 
              args={{subject, ...info, year: selected_year}} 
            />
        }
        { treatAsProgram(subject) &&
            <TM
              k={"program_crso_budget_measures_panel_text"} 
              args={{subject, ...info, year: selected_year}} 
            />
        }
      </div>
    </div>;
  
    if(window.is_a11y_mode){

      const program_allocation_data = subject.level === "dept" ?
          get_program_allocation_data_from_dept_data(data) :
          [];

      return <div>
        { text_area }
        <A11YTable
          table_name = { text_maker("budget_measure_a11y_table_title") }
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
        { subject.level === "gov" &&
            <A11YTable
              table_name = { text_maker("budget_org_a11y_table_title") }
              data = {_.map( get_org_budget_data_from_all_measure_data(data),
                (org_item) => ({
                  label: org_item.label,
                  data: _.filter([
                    <Format
                      key = { org_item.key + "col3" } 
                      type = "compact1" 
                      content = { org_item.data.funding } 
                    />,
                    <Format
                      key = { org_item.key + "col4" } 
                      type = "compact1"
                      content = { org_item.data.allocated } 
                    />,
                    <Format
                      key = { org_item.key + "col5" } 
                      type = "compact1"
                      content = { org_item.data.withheld } 
                    />,
                    <Format
                      key = { org_item.key + "col6" } 
                      type = "compact1"
                      content = { org_item.data.remaining } 
                    />,
                  ]),
                })
              )}
              label_col_header = { text_maker("org") }
              data_col_headers = {_.filter([
                budget_values.funding.text,
                budget_values.allocated.text,
                budget_values.withheld.text,
                budget_values.remaining.text,
              ])}
            />
        }
        { subject.level === "dept" && !_.isEmpty(program_allocation_data) &&
            <A11YTable
              table_name = { text_maker("budget_program_a11y_table_title") }
              data = {_.map( program_allocation_data, 
                (program_item) => ({
                  label: program_item.label,
                  data: _.filter([
                    <Format
                      key = { program_item.key + "col3" } 
                      type = "compact1" 
                      content = { program_item.data.allocated } 
                    />,
                  ]),
                })
              )}
              label_col_header = { text_maker("program") }
              data_col_headers = {_.filter([
                budget_values.allocated.text,
              ])}
            />
        }
      </div>;
    } else {
      const biv_value_colors = infobase_colors(biv_values);
      const bar_colors = (data_label) => {
        if (effective_selected_value === 'funding_overview'){
          return biv_value_colors(data_label);
        } else {
          if ( data_label.includes("__negative_valued") ){
            return "#ff7e0f";
          } else {
            return "#1f77b4";
          }
        }
      }

      return <div>
        { text_area }
        <div className = "frow">
          <div className = "fcol-md-12 budget-panel-controls-and-graph">
            <div className = 'centerer'>
              <label>
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
                  className = "form-control"
                />
              </label>
              <label>
                <TM k="budget_panel_select_value" />
                <Select 
                  selected = {effective_selected_value}
                  options = {_.map(value_options, 
                    ({name, id}) => ({ 
                      id,
                      display: name,
                    })
                  )}
                  onSelect = { id => this.setState({selected_value: id}) }
                  className = "form-control"
                />
              </label>
            </div>
            <div className = 'centerer'>
              { effective_selected_value === 'funding_overview' &&
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
            <div className = 'budget-panel-graph-label'>
              <span>
                { 
                  _.chain(grouping_options)
                    .filter(option => option.id === selected_grouping)
                    .thru(nested_option => nested_option[0].name)
                    .value()
                }
              </span>
            </div>
            <div className = 'budget-panel-graph'>
              <StackedHbarChart
                font_size="12px"
                bar_height={60} 
                data = {graph_ready_data}
                formatter = {formats.compact1}
                colors = {bar_colors}
                paginate = {true}
                items_per_page = {10}
              />
            </div>
          </div>
        </div> 
      </div>;
    }
  }
}
