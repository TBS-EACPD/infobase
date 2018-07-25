import './BudgetMeasuresRoute.yaml';
import { Subject } from '../../models/subject';
import { businessConstants } from '../../models/businessConstants.js';
import { ensure_loaded } from '../../core/lazy_loader.js';
import { StandardRouteContainer } from '../../core/NavComponents.js';
import { 
  SpinnerWrapper,
} from '../../util_components';

import {
  text_maker,
  TextMaker,
} from './budget_measure_text_provider.js';

import { BudgetMeasuresControls } from './BudgetMeasuresControls.js';
import { BudgetMeasuresPartition } from './BudgetMeasuresPartition.js';

import { BudgetMeasuresA11yContent } from './BudgetMeasuresA11yContent.js';

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
  const selected_value_is_valid = _.indexOf(_.keys(budget_values), selected_value) !== -1;

  if (first_column_is_valid && selected_value_is_valid){
    return true;
  } else {
    const valid_first_column = first_column_is_valid ? first_column : first_column_options[0].id;
    const valid_value = selected_value_is_valid ? selected_value : "allocated";
    const corrected_route = `/budget-measures/${valid_first_column}/${valid_value}`;
    history.push(corrected_route);

    return false;
  }
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
      subject: Subject.BudgetMeasure,
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

    const history = this.props.history;
    const first_column = this.props.match.params.first_column;
    const selected_value = this.props.match.params.selected_value;

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
          <div className = "budget-measures">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "0px 20px 5px 20px",
                fontSize: "19px",
              }}
            >
              <TextMaker text_key="budget_route_top_text" />
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