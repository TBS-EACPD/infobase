import './BudgetMeasuresRoute.ib.yaml';

import * as Subject from '../../models/subject';
import { ensure_loaded } from '../../core/lazy_loader.js';
import { StandardRouteContainer } from '../../core/NavComponents.js';
import { 
  SpinnerWrapper,
  TextMaker,
} from '../../util_components';
import { text_maker } from "../../models/text";

import { BudgetMeasuresControls } from './BudgetMeasuresControls.js';
import { BudgetMeasuresPartition } from './BudgetMeasuresPartition.js';

import { BudgetMeasuresA11yContent } from './BudgetMeasuresA11yContent.js';

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

const validate_first_column_route_param = (first_column, history) => {
  if ( _.indexOf(first_column_ids, first_column) === -1 ){
    history.push(`/budget-measures/${first_column_options[0].id}`);
    return false;
  } else {
    return true;
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

    validate_first_column_route_param(props.match.params.first_column, props.history);
  }
  shouldComponentUpdate(nextProps){
    return validate_first_column_route_param(nextProps.match.params.first_column, this.props.history);
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

    return (
      <StandardRouteContainer
        ref = "container"
        title = { text_maker("budget_measures") }
        description = { text_maker("budget_home_text") }
        breadcrumbs = { [text_maker("budget_measures")] }
        route_key = "budget-measures"
      >
        <h1>
          {text_maker("budget_measures")}
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