import './BudgetMeasuresRoute.yaml';
import './BudgetMeasuresRoute.scss';
import { Fragment } from 'react';
import { Subject } from '../../models/subject';
import { businessConstants } from '../../models/businessConstants.js';
import { ensure_loaded } from '../../core/lazy_loader.js';
import { StandardRouteContainer } from '../../core/NavComponents.js';
import { 
  SpinnerWrapper,
  Details,
  EmbeddedVideo,
  TabbedControls,
} from '../../util_components';

import {
  text_maker,
  TextMaker,
} from './budget_measure_text_provider.js';

import { calculate_budget_stats } from './calculate_budget_stats.js';

import { BudgetMeasuresControls } from './BudgetMeasuresControls.js';
import { BudgetMeasuresPartition } from './BudgetMeasuresPartition.js';
import { BudgetMeasuresFooter } from './BudgetMeasuresFooter.js';
import { BudgetMeasuresA11yContent } from './BudgetMeasuresA11yContent.js';

const { BudgetMeasure } = Subject;
const { 
  budget_years,
  budget_data_source_dates,
  main_estimates_budget_links,
} = BudgetMeasure;

const { budget_values } = businessConstants;

const selected_value_options = [..._.keys(budget_values), "overview"];

const first_column_options = [
  {
    id: "budget-measure",
    display: text_maker("budget_measure"),
  },
  {
    id: "dept",
    display: text_maker("org"),
  },
];
const first_column_ids = _.map( first_column_options, option => option.id );

const budget_year_options = budget_years.map(year => `budget-${year}`);
const get_year_value_from_budget_year = (budget_year) => _.chain(budget_year_options)
  .indexOf(budget_year)
  .thru( year_index => budget_years[year_index] )
  .value();

const validate_route = (props) => {
  const {
    history,
    match: {
      params: {
        first_column,
        selected_value,
        budget_year,
      },
    },
  } = props;

  const first_column_is_valid = _.includes(first_column_ids, first_column);
  const selected_value_is_valid = _.includes(selected_value_options, selected_value);
  const budget_year_is_valid = _.includes(budget_year_options, budget_year);

  if (first_column_is_valid && selected_value_is_valid && budget_year_is_valid){
    return true;
  } else {
    const valid_first_column = first_column_is_valid ? first_column : _.first(first_column_options).id;
    const valid_value = selected_value_is_valid ? selected_value : "overview";
    const valid_year = budget_year_is_valid ? budget_year : _.last(budget_year_options);

    const corrected_route = `/budget-tracker/${valid_first_column}/${valid_value}/${valid_year}`;
    history.replace(corrected_route);

    return false;
  }
};

export default class BudgetMeasuresRoute extends React.Component {
  constructor(props){
    super();
    this.state = {
      loading: true,
      loaded_years: [],
      filter_string: false,
    };

    validate_route(props);
  }
  static getDerivedStateFromProps(props, state){
    const {
      match: {
        params: {
          budget_year,
        },
      },
    } = props;

    const { loaded_years } = state;

    return {loading: !_.includes(loaded_years, budget_year)};
  }
  shouldComponentUpdate(nextProps){
    return validate_route(nextProps);
  }
  conditionallyLoadOnMountAndUpdate(){
    const {
      match: {
        params: {
          budget_year,
        },
      },
    } = this.props;

    const {
      loading,
      loaded_years,
    } = this.state;

    if ( loading && !_.isUndefined(budget_year) && !_.includes(loaded_years, budget_year) ){
      ensure_loaded({
        budget_measures: true,
        budget_years: [ get_year_value_from_budget_year(budget_year) ],
      }).then( () => {
        this.setState({
          loading: false,
          loaded_years: [
            ...loaded_years,
            budget_year,
          ],
        });
      });
    }
  }
  componentDidMount(){ this.conditionallyLoadOnMountAndUpdate() }
  componentDidUpdate(){ this.conditionallyLoadOnMountAndUpdate() }
  setFilterString(new_filter_string){
    this.setState({filter_string: new_filter_string});
  }
  render(){
    const {
      loading,
      filter_string,
    } = this.state;

    const {
      history,
      match: {
        params: {
          first_column,
          selected_value,
          budget_year,
        },
      },
    } = this.props;

    const year_value = get_year_value_from_budget_year(budget_year);

    const inner_content = (
      <Fragment>
        { loading && <SpinnerWrapper ref="spinner" config_name={"route"} /> }
        { !loading &&
          <div className="budget-measures">
            <div className="budget-measures-top-text">
              { year_value === "2018" &&
                <EmbeddedVideo
                  title = { text_maker("budget_alignment_video_title") }
                  video_source = { text_maker("budget_alignment_video_src") }
                  transcript = { text_maker("budget_alignment_video_transcript") }
                />
              }
              <TextMaker 
                text_key={`budget${year_value}_route_top_text`}
                args={{
                  budget_year: year_value,
                  budget_data_source_date: budget_data_source_dates[year_value],
                  main_estimates_budget_link: main_estimates_budget_links[year_value],
                }}
              />
              <Details
                summary_content = { <TextMaker text_key="budget_stats_title" /> }
                content = { 
                  <TextMaker 
                    text_key="budget_summary_stats" 
                    args={{
                      ...calculate_budget_stats( get_year_value_from_budget_year(budget_year) ),
                      budget_year: get_year_value_from_budget_year(budget_year),
                      budget_data_source_date: budget_data_source_dates[year_value],
                    }}
                  /> 
                }
              />
            </div>
            { !window.is_a11y_mode &&
              <Fragment>
                <BudgetMeasuresControls
                  selected_value = { budget_year === "budget-2019" ? "funding" : selected_value } // TEMPORARILY lock the 2019 view to the funding value
                  first_column = { first_column }
                  history = { history }
                  budget_year = { budget_year }
                  group_by_items = { first_column_options }
                  filter_string = { filter_string }
                  setFilterString = { this.setFilterString.bind(this) }
                />
                <BudgetMeasuresPartition
                  selected_value = { budget_year === "budget-2019" ? "funding" : selected_value } // TEMPORARILY lock the 2019 view to the funding value
                  first_column = { first_column }
                  budget_year = { budget_year }
                  year_value = { year_value }
                  filter_string = { filter_string }
                />
                <BudgetMeasuresFooter/>
              </Fragment>
            }
            { window.is_a11y_mode && 
              <BudgetMeasuresA11yContent 
                year_value = { year_value }
              />
            }
          </div>
        }
      </Fragment>
    );

    return (
      <StandardRouteContainer
        ref = "container"
        title = { text_maker("budget_route_title") }
        description = { text_maker("budget_measures_desc_meta_attr") }
        breadcrumbs = { [text_maker("budget_route_title")] }
        route_key = "budget-measures"
      >
        <h1>
          {text_maker("budget_route_title")}
        </h1>
        { budget_years.length === 1 && inner_content }
        { budget_years.length > 1 && 
          <Fragment>
            <TabbedControls 
              tab_callback = {
                (key) => {
                  const new_path = `/budget-tracker/${first_column}/${selected_value}/${key}`;
                  if ( history.location.pathname !== new_path ){
                    history.push(new_path);
                  }
                } 
              }
              tab_options = { 
                _.map(
                  budget_year_options, 
                  (budget_year_option) => ({
                    key: budget_year_option,
                    label: `${text_maker("budget_name_header")} ${get_year_value_from_budget_year(budget_year_option)}`,
                    is_open: budget_year_option === budget_year,
                  })
                )
              }
            />
            {inner_content}
          </Fragment>
        }
      </StandardRouteContainer>
    );
  }
}