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
const first_column_ids = _.map(first_column_options, option => option.id );

const budget_year_options = ["budget-2018", "budget-2019"];


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
  const budget_year_is_valid = _.includes(budget_year_options, selected_value);

  if (first_column_is_valid && selected_value_is_valid){
    return true;
  } else {
    const valid_first_column = first_column_is_valid ? first_column : first_column_options[0].id;
    const valid_value = selected_value_is_valid ? selected_value : "overview";
    const valid_year = budget_year_is_valid ? budget_year : _.last(budget_year_options);

    const corrected_route = `/budget-tracker/${valid_first_column}/${valid_value}/${valid_year}`;
    history.push(corrected_route);

    return false;
  }
};

export default class BudgetMeasuresRoute extends React.Component {
  constructor(props){
    super();
    this.state = {
      loading: true,
      filtered_chapter_keys: [],
      filter_string: false,
    };

    validate_route(props);
  }
  shouldComponentUpdate(nextProps){
    return validate_route(nextProps);
  }
  componentDidMount(){
    ensure_loaded({
      subject: BudgetMeasure,
    }).then( () => {
      this.setState({loading: false});
    });
  }
  setFilteredChapterKeys(new_filtered_chapter_keys){
    this.setState({filtered_chapter_keys: new_filtered_chapter_keys});
  }
  setFilterString(new_filter_string){
    this.setState({filter_string: new_filter_string});
  }
  render(){
    const {
      loading,
      filtered_chapter_keys,
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

    if ( !loading && _.isUndefined(this.summary_stats) ){
      this.summary_stats = calculate_budget_stats();
    }

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
        { loading && <SpinnerWrapper ref="spinner" config_name={"route"} /> }
        { !loading &&
          <div className="budget-measures">
            <div className="budget-measures-top-text">
              <EmbeddedVideo
                title={ text_maker("budget_alignment_video_title") }
                video_source={ text_maker("budget_alignment_video_src") }
                transcript={ text_maker("budget_alignment_video_transcript") }
              />
              <TextMaker text_key="budget_route_top_text" />
              <Details
                summary_content={ <TextMaker text_key="budget_stats_title" /> }
                content={ <TextMaker text_key="budget_summary_stats" args={this.summary_stats} /> }
              />
            </div>
            { !window.is_a11y_mode &&
              <Fragment>
                <BudgetMeasuresControls
                  selected_value = { selected_value }
                  first_column = { first_column }
                  history = { history }
                  group_by_items = { first_column_options }
                  filtered_chapter_keys = { filtered_chapter_keys }
                  setFilteredChapterKeysCallback = { this.setFilteredChapterKeys.bind(this) }
                  filter_string = { filter_string }
                  setFilterString = { this.setFilterString.bind(this) }
                />
                <BudgetMeasuresPartition
                  selected_value = { selected_value }
                  first_column = { first_column }
                  filtered_chapter_keys = { filtered_chapter_keys }
                  filter_string = { filter_string }
                />
                <BudgetMeasuresFooter/>
              </Fragment>
            }
            { window.is_a11y_mode && <BudgetMeasuresA11yContent/> }
          </div>
        }
      </StandardRouteContainer>
    );
  }
}