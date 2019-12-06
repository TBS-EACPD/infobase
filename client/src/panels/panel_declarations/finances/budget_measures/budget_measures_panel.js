import "./budget_measures_panel.scss";
import text1 from "./budget_measures_panel.yaml";
import text2 from "../../../../partition/budget_measures_subapp/BudgetMeasuresRoute.yaml";

import { Fragment } from 'react';
import MediaQuery from 'react-responsive';

import {
  formats,
  Subject,
  businessConstants,
  util_components,
  declarative_charts,
  create_text_maker_component,
  InfographicPanel,
  NivoResponsiveHBar,
  newIBLightCategoryColors,
  infograph_href_template,
  ensure_loaded,
  
  declare_panel,

  TspanLineWrapper,
} from "../../shared.js";


const { budget_values } = businessConstants;

const { 
  BudgetMeasure,
  Dept,
  Program,
  CRSO,
} = Subject;

import {Service} from '../../../../models/services.js';


const { 
  budget_years, 
  budget_data_source_dates,
  main_estimates_budget_links,
} = BudgetMeasure;

const {
  Select,
  Format,
  TabbedControls,
  SpinnerWrapper,
} = util_components;

const { A11YTable } = declarative_charts;

const { text_maker, TM } = create_text_maker_component([text1,text2]);

const TOP_TO_SHOW = 25;


const treatAsProgram = (subject) => _.indexOf(["program", "crso"], subject.level) !== -1;

const get_grouping_options = (subject, data) =>{
  const common_options = [
    {
      name: text_maker('budget_measures'),
      id: 'measures',
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
};

const calculate_stats_common = (data, subject) => {
  const total_funding = _.reduce(data,
    (total, budget_measure) => total + budget_measure.measure_data.funding, 
    0
  );

  const total_allocated = _.reduce(data,
    (total, budget_measure) => total + budget_measure.measure_data.allocated, 
    0
  );

  const measure_count = data.length;

  const year_from_data = _.first(data).year;
  const vote_count = subject.level === "gov" ? 
    (year_from_data === "2018" ? 1 : _.flatMap(data, (d) => d.data).length) :
    1;

  return {
    total_funding,
    total_allocated,
    measure_count,
    vote_count,
    multiple_measures: measure_count > 1,
    multiple_votes: vote_count > 1,
  };
};

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
};


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
  crso: crso_program_calculate, // only count budget items allocated directly to CRSOs
};

const budget_measure_render = function({calculations, footnotes, sources}){

  const { panel_args } = calculations;

  return (
    <InfographicPanel
      title={text_maker("budget_measures_panel_title")}
      {...{
        sources, 
        footnotes: _.compact([
          ...footnotes,
          (_.includes(["gov", 133, 55], panel_args.subject.id) && {text: text_maker("budget2019_biv_includes_excludes_note")}),
        ]),
      }}
    >
      <BudgetMeasurePanel panel_args = { panel_args } />
    </InfographicPanel>
  );
};


class BudgetMeasurePanel extends React.Component {
  constructor(props){
    super(props);
    const { 
      panel_args: {
        years_with_data,
      },
    } = props;

    this.state = {
      years_with_data,
      selected_year: _.last(years_with_data),
      loading: true,
    };
  }
  mountAndUpdate(){
    const { 
      panel_args: {
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
  componentDidMount(){ this.mountAndUpdate(); }
  componentDidUpdate(){ this.mountAndUpdate(); }
  render(){
    const { panel_args } = this.props;

    const { subject } = panel_args;

    const {
      years_with_data,
      selected_year,
      loading,
    } = this.state;

    const inner_content = (
      <Fragment>
        { loading &&
          <div style={{position: "relative", height: "80px", marginBottom: "-10px"}}>
            <SpinnerWrapper config_name={"tabbed_content"} />
          </div>
        }
        { !loading &&
          <BudgetMeasureHBars panel_args={ panel_args } selected_year={ selected_year } />
        }
      </Fragment>
    );

    const above_tab_text = <div className = "frow" >
      { years_with_data.length === 1 && ( subject.level === "dept" || treatAsProgram(subject) ) &&
        <div className = "fcol-md-12 fcol-xs-12 medium_panel_text text">
          { ( panel_args.subject.level === "dept" || treatAsProgram(subject) ) &&
              <TM
                k={"budget_measures_above_tab_text"} 
                args={{
                  subject,
                  budget_year_1: budget_years[0],
                  budget_year_2: budget_years[1],
                  funding_only_2018: selected_year === "2018",
                }}
              />
          }
        </div>
      }
    </div>;

    return (
      <Fragment>
        {treatAsProgram(subject) || <div>{above_tab_text}</div>}
        <div className="tabbed-content">
          <TabbedControls
            tab_callback={ (year) => this.setState({loading: true, selected_year: year}) }
            tab_options={
              _.map(
                treatAsProgram(subject) ? years_with_data : budget_years,
                (year) => ({
                  key: year,
                  label: `${text_maker("budget_name_header")} ${year}`,
                  is_open: selected_year === year,
                  is_disabled: !(_.includes(years_with_data, year)),
                })
              )
            }
          />
          <div className="tabbed-content__pane">
            {inner_content}
          </div>
        </div>
      </Fragment>
    );
  }
}


class BudgetMeasureHBars extends React.Component {
  constructor(props){
    super(props);

    const { 
      panel_args: {
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
      panel_args: {
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
    const info = get_info(data, subject); 
    
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

    const valid_selected_value = _.filter(value_options, value_option => value_option.id === selected_value).length === 1 ?
      selected_value :
      value_options[0].id;

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
            );
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
                name: program.name,
                href: infograph_href_template(program, "financial"),
                allocated: program_allocation,
                data: {"allocated": program_allocation},
              };
            } else {
                window.is_dev && console.warn(`Budget panel: missing program ${program_id}`); // eslint-disable-line
    
              return {
                key: program_id,
                name: program_id,
                href: false,
                allocated: program_allocation,
                data: {"allocated": program_allocation},
              };
            }
          }
        )
        .sortBy("allocated")
        .value();
    };

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
              const summed = {
                __typename: dept.level,
                key: org_id,
                name: dept.name,
                href: infograph_href_template(dept, "financial"),
              };
              _.each(
                org_group,
                item => {
                  _.each(_.keys(budget_values), amount => {
                    summed[amount] = (summed[amount] || 0) + item[amount];
                  });
                }
              );
              return summed;
            }
          }
        )
        .filter()
        .value();
    };

    const get_top_data = (data, grouping, value) => {
      const sorted_data = _.chain(data)
        .map(measure => ({...measure, ...measure.measure_data}))
        .sortBy(value === "funding_overview" ? "funding" : value)
        .reverse()
        .value();

      const top_data = _.take(sorted_data, TOP_TO_SHOW);

      const others = {
        measure_id: 99999,
        chapter_key: null,
        description: "",
        name: text_maker("x_smaller_" + grouping, {smaller_items_count: sorted_data.length - TOP_TO_SHOW}),
        section_id: null,
        year: selected_year,
      };

      _.each(
        _.chain(sorted_data)
          .tail(TOP_TO_SHOW)
          .map(measure => ({...measure, ...measure.measure_data}))
          .value(),
        item => {
          _.each(_.keys(budget_values), amount => {
            others[amount] = (others[amount] || 0) + item[amount];
          });
        }
      );
      return _.reverse( sorted_data.length > TOP_TO_SHOW ? _.concat(top_data,others) : sorted_data );
    };

    const filtered_data_by_selected_group = _.filter(
      {
        measures: get_top_data(data, valid_selected_grouping, valid_selected_value),
        orgs: get_top_data( get_org_budget_data_from_all_measure_data(data), valid_selected_grouping, valid_selected_value ),
        programs: get_program_allocation_data_from_dept_data(data),
      }[valid_selected_grouping],
      row => valid_selected_value !== "funding_overview" ?
        row[valid_selected_value] :
        row.funding
    );

    return {
      data: filtered_data_by_selected_group,
      info,
      grouping_options,
      selected_grouping: valid_selected_grouping,
      selected_value: valid_selected_value,
      value_options,
      get_program_allocation_data_from_dept_data,
      get_org_budget_data_from_all_measure_data,
    };
  }
  render(){
    const { 
      panel_args: {
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
      get_program_allocation_data_from_dept_data,
      get_org_budget_data_from_all_measure_data,
    } = this.state;

    // table stuff
    const has_budget_links = selected_year === "2018";

    // graph stuff
    const formatter = formats.compact1_raw;

    // text stuff
    const panel_text_args = {
      subject,
      ...info, 
      budget_year: selected_year, 
      budget_data_source_date: budget_data_source_dates[selected_year],
      main_estimates_budget_link: main_estimates_budget_links[selected_year],
    };
    const tick_map = _.chain(data)
      .map(
        (row) => [
          row.name,
          (row.__typename === "BudgetMeasure" ?
          row.chapter_key && BudgetMeasure.make_budget_link(row.chapter_key, row.ref_id) :
          row.href
          ),
        ]
      )
      .fromPairs()
      .value();
  
    const text_area = <div className = "frow" >
      <div className = "fcol-md-12 fcol-xs-12 medium_panel_text text">
        { subject.level === "gov" &&
            <TM 
              k={"gov_budget_measures_panel_text"} 
              args={panel_text_args} 
            />
        }
        { subject.level === "dept" &&
            <TM
              k={"dept_budget_measures_panel_text"} 
              args={panel_text_args} 
            />
        }
        { treatAsProgram(subject) &&
            <TM
              k={"program_crso_budget_measures_panel_text"} 
              args={panel_text_args} 
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
                !treatAsProgram(subject) && <Format
                  key = { budget_measure_item.id + "col2" } 
                  type = "compact1_written" 
                  content = { budget_measure_item.funding } 
                />,
                <Format
                  key = { budget_measure_item.id + (treatAsProgram(subject) ? "col2" : "col3") } 
                  type = "compact1_written"
                  content = { budget_measure_item.allocated } 
                />,
                !treatAsProgram(subject) && <Format
                  key = { budget_measure_item.id + "col4" } 
                  type = "compact1_written"
                  content = { budget_measure_item.withheld } 
                />,
                !treatAsProgram(subject) && <Format
                  key = { budget_measure_item.id + "col5" } 
                  type = "compact1_written"
                  content = { budget_measure_item.remaining } 
                />,
                has_budget_links && <a 
                  key = { budget_measure_item.id + (treatAsProgram(subject) ? "col3" : "col6") }
                  href = { BudgetMeasure.make_budget_link(budget_measure_item.chapter_key, budget_measure_item.ref_id) }
                >
                  { text_maker("link") }
                </a>,
              ]),
            })
          )}
          label_col_header = { text_maker("budget_measure") }
          data_col_headers = {_.filter([
            !treatAsProgram(subject) && budget_values.funding.text,
            budget_values.allocated.text,
            !treatAsProgram(subject) && budget_values.withheld.text,
            !treatAsProgram(subject) && budget_values.remaining.text,
            has_budget_links && text_maker("budget_panel_a11y_link_header"),
          ])}
        />
        { subject.level === "gov" &&
            <A11YTable
              table_name = { text_maker("budget_org_a11y_table_title") }
              data = {_.map( get_org_budget_data_from_all_measure_data(data),
                (org_item) => ({
                  label: org_item.name,
                  data: _.filter([
                    <Format
                      key = { org_item.key + "col3" } 
                      type = "compact1_written" 
                      content = { org_item.funding } 
                    />,
                    <Format
                      key = { org_item.key + "col4" } 
                      type = "compact1_written"
                      content = { org_item.allocated } 
                    />,
                    <Format
                      key = { org_item.key + "col5" } 
                      type = "compact1_written"
                      content = { org_item.withheld } 
                    />,
                    <Format
                      key = { org_item.key + "col6" } 
                      type = "compact1_written"
                      content = { org_item.remaining } 
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
                  label: program_item.name,
                  data: _.filter([
                    <Format
                      key = { program_item.key + "col3" } 
                      type = "compact1_written" 
                      content = { program_item.allocated } 
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
      const biv_value_colors = d3.scaleOrdinal().range(_.at(newIBLightCategoryColors, [0,2,4]));

      const nivo_default_props = {
        data: _.map(
          data,
          measure => _.chain(measure)
            .pick([..._.keys(budget_values), "name"])
            .mapKeys((v,k) => k === "name" ? k : budget_values[k].text)
            .value()
        ),
        indexBy: "name",
        keys: _.chain(selected_value)
          .thru(
            selected_value => selected_value === "funding_overview" ? 
              _.chain(budget_values).keys().without('funding').value() :
              [selected_value]
          )
          .map(key => budget_values[key].text)
          .value(),
        enableLabel: true,
        label: d => formatter(d.value),
        colorBy: d => biv_value_colors(d.id),
        margin: {
          top: 20,
          right: 20,
          bottom: 100,
          left: 300,
        },
        bttm_axis: {
          tickSize: 5,
          tickPadding: 5,
          tickValues: 6,
          format: (d) => formatter(d),
        },
        left_axis: {
          tickSize: 5,
          tickPadding: 5,
          renderTick: tick => (
            <g key={tick.key} transform={`translate(${tick.x-10},${tick.y})`}>
              <a
                href={tick_map[tick.value]}
                target="_blank" rel="noopener noreferrer"
              >
                <text
                  textAnchor="end"
                  dominantBaseline="end"
                  style={{
                    ...tick.theme.axis.ticks.text,
                  }}
                >
                  <TspanLineWrapper text={tick.value} width={50}/>
                </text>
              </a>
            </g>
          ),
        },
        padding: 0.1,
        is_money: true,
        enableGridX: false,
        enableGridY: false,
        isInteractive: true,
        labelSkipWidth: 60,
        legends: [
          {
            dataFrom: "keys",
            anchor: "top",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: -10,
            itemsSpacing: 2,
            itemWidth: 200,
            itemHeight: 0,
            itemDirection: "left-to-right",
            symbolSize: 20,
          },
        ],
      };

      const nivo_mobile_props = _.merge(
        {},
        nivo_default_props,
        {
          margin: {
            right: 10,
            left: 250,
            top: 80,
            bottom: 25,
          },
          bttm_axis: {
            tickValues: 3,
          },
          left_axis: {
            format: (d) => <TspanLineWrapper text={d} width={28}/>,
          },
          legends: [
            {
              direction: "column",
              translateX: -100,
              translateY: -70,
              itemHeight: 20,
            },
          ],
        }
      );
      
      return (
        <Fragment>
          {text_area}
          <div className = 'row' style={{marginBottom: "10px"}}>
            <div className = 'col-sm-6' align="center">
              <label style={{padding: "7px"}} htmlFor='select_grouping'>
                {text_maker('budget_panel_group_by')}
              </label>
              <Select 
                id = 'select_grouping'
                selected = {selected_grouping}
                options = {_.map(grouping_options, 
                  ({name, id}) => ({
                    id,
                    display: name,
                  })
                )}
                onSelect = { id => this.setState({selected_grouping: id}) }
                className = "form-control"
                style = {{padding: "5px"}}
              />
            </div>
            <div className = 'col-sm-6' align="center">
              <label style={{padding: "7px"}} htmlFor='select_value'>
                {text_maker('budget_panel_select_value')}
              </label>
              <Select 
                id = 'select_value'
                selected = {selected_value}
                options = {_.map(value_options, 
                  ({name, id}) => ({ 
                    id,
                    display: name,
                  })
                )}
                onSelect = { id => this.setState({selected_value: id}) }
                className = "form-control"
                style = {{padding: "5px"}}
              />
            </div>
          </div>
          <MediaQuery minWidth={992}>
            <div className="centerer" style={{height: `${data.length*30 + 150}px`}}>
              <NivoResponsiveHBar
                {...nivo_default_props}
              />
            </div>
          </MediaQuery>
          <MediaQuery maxWidth={992}>
            <div className="centerer" style={{height: `${data.length*40 + 150}px`}}>
              <NivoResponsiveHBar
                {...nivo_mobile_props}
              />
            </div>
          </MediaQuery>
        </Fragment>
      );
    }
  }
}


export const declare_budget_measures_panel = () => declare_panel({
  panel_key: "budget_measures_panel",
  levels: ['gov', 'dept', 'program', 'crso'],
  panel_config_func: (level_name, panel_key) => ({
    requires_has_budget_measures: true,
    footnotes: false,
    source: (subject) => [
      {
        html: text_maker("budget_route_title"),
        href: "#budget-tracker/budget-measure/overview",
      },
      {
        html: "Budget",
        href: "#metadata/BUDGET",
      },
    ],
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
  }),
});