import './BudgetMeasuresRoute.yaml';
import './BudgetMeasuresRoute.scss';
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

import { BudgetMeasuresControls } from './BudgetMeasuresControls.js';
import { BudgetMeasuresPartition } from './BudgetMeasuresPartition.js';

import { BudgetMeasuresA11yContent } from './BudgetMeasuresA11yContent.js';

const { BudgetMeasure } = Subject;

const { budget_values } = businessConstants;

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

const validate_route = (first_column, selected_value, history) => {
  const first_column_is_valid = _.indexOf(first_column_ids, first_column) !== -1;
  const selected_value_is_valid = _.indexOf([..._.keys(budget_values), "overview"], selected_value) !== -1;

  if (first_column_is_valid && selected_value_is_valid){
    return true;
  } else {
    const valid_first_column = first_column_is_valid ? first_column : first_column_options[0].id;
    const valid_value = selected_value_is_valid ? selected_value : "overview";
    const corrected_route = `/budget-measures/${valid_first_column}/${valid_value}`;
    history.push(corrected_route);

    return false;
  }
}

const calculate_summary_stats = () => {
  const all_budget_measures = BudgetMeasure.get_all();
  const reduce_by_budget_value = (data) => _.chain(budget_values)
    .keys()
    .map( key => [
      key,
      _.reduce(data, (memo, data_row) => memo + data_row[key], 0),
    ])
    .fromPairs()
    .value()
  const rolled_up_data_rows = _.map(all_budget_measures, budget_measure => reduce_by_budget_value(budget_measure.data) );

  const total_allocations_by_programs_and_internal_services = _.chain(all_budget_measures)
    .flatMap( budget_measure => _.map(
      budget_measure.data, 
      data_row => _.map(
        data_row.program_allocations,
        (program_allocation, program_id) => [program_id, program_allocation] 
      )
    ))
    .filter( program_allocation_pairs => !_.isEmpty(program_allocation_pairs) )
    .flatten()
    .groupBy( program_allocation_pairs => program_allocation_pairs[0].includes("ISS00") ?
      "internal_services" :
      "programs"
    )
    .mapValues( grouped_program_allocation_pairs => _.chain(grouped_program_allocation_pairs)
      .groupBy( program_allocation_pair => program_allocation_pair[0] )
      .mapValues( program_allocation_pairs => _.reduce(
        program_allocation_pairs, 
        (sum, program_allocation_pair) => sum + program_allocation_pair[1], 
        0
      ))
      .value()
    )
    .value();

  const funding_data_totals = reduce_by_budget_value(rolled_up_data_rows);

  const measure_count = all_budget_measures.length;
  
  const allocated_to_measure_count = _.filter(rolled_up_data_rows, data_row => data_row.allocated ).length;

  const allocated_to_program_count = _.size(total_allocations_by_programs_and_internal_services.programs);

  const allocated_to_internal_services_count = _.size(total_allocations_by_programs_and_internal_services.internal_services);

  const allocated_to_all_program_count = allocated_to_program_count + allocated_to_internal_services_count;

  const total_internal_service_allocated = _.reduce(
    total_allocations_by_programs_and_internal_services.internal_services,
    (sum, internal_service_total_allocation) => sum + internal_service_total_allocation,
    0
  );
  
  const no_remaining_funds_count = _.filter(
    rolled_up_data_rows,
    data_row => data_row.remaining === 0
  ).length;

  const no_funding_in_year_count = _.filter(
    rolled_up_data_rows,
    data_row => data_row.funding === 0
  ).length;

  const fully_withheld_funds_count = _.filter(
    rolled_up_data_rows,
    data_row => data_row.funding !== 0 && (data_row.funding === data_row.withheld)
  ).length;

  const totally_funded_count = no_remaining_funds_count - no_funding_in_year_count - fully_withheld_funds_count;

  const less_one_percent_remaining_funds_count = _.chain(rolled_up_data_rows)
    .filter( data_row => data_row.remaining !== 0 )
    .map( data_row => Math.abs(data_row.remaining/data_row.funding) )
    .filter( percent_remaining => percent_remaining < 0.01 )
    .value()
    .length;

  return {
    measure_count,
    total_funding: funding_data_totals.funding,
    total_allocated: funding_data_totals.allocated,
    total_allocated_share: funding_data_totals.allocated/funding_data_totals.funding,
    total_withheld: funding_data_totals.withheld,
    total_withheld_share: funding_data_totals.withheld/funding_data_totals.funding,
    total_remaining: funding_data_totals.remaining,
    total_remaining_share: funding_data_totals.remaining/funding_data_totals.funding,
    allocated_to_measure_count,
    allocated_to_all_program_count,
    allocated_to_internal_services_count,
    total_internal_service_allocated,
    totally_funded_count,
    no_funding_in_year_count,
    fully_withheld_funds_count,
    less_one_percent_remaining_funds_count,
  };
}

export class BudgetMeasuresRoute extends React.Component {
  constructor(props){
    super();
    this.state = {
      loading: true,
      filtered_chapter_keys: [],
      filter_string: false,
    };

    validate_route(props.match.params.first_column, props.match.params.selected_value, props.history);
  }
  shouldComponentUpdate(nextProps){
    return validate_route(nextProps.match.params.first_column, nextProps.match.params.selected_value, this.props.history);
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
        },
      },
    } = this.props;

    if ( !loading && _.isUndefined(this.summary_stats) ){
      this.summary_stats = calculate_summary_stats();
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
        { loading && <SpinnerWrapper ref="spinner" scale = { 4 } /> }
        { !loading &&
          <div className="budget-measures">
            <div className="budget-measures-top-text">
              <EmbeddedVideo
                video_source="https://www.youtube.com/embed/2icdh1fbuho?rel=0"
                transcript={ text_maker("budget_alignment_video_transcript") }
              />
              <TextMaker text_key="budget_route_top_text" />
              <Details
                summary_content={ <TextMaker text_key="budget_stats_title" /> }
                content={ <TextMaker text_key="budget_summary_stats" args={this.summary_stats} /> }
              />
            </div>
            { !window.is_a11y_mode &&
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
            }
            { !window.is_a11y_mode &&
              <BudgetMeasuresPartition
                selected_value = { selected_value }
                first_column = { first_column }
                filtered_chapter_keys = { filtered_chapter_keys }
                filter_string = { filter_string }
              />
            }
            { window.is_a11y_mode && <BudgetMeasuresA11yContent/> }
          </div>
        }
      </StandardRouteContainer>
    );
  }
}