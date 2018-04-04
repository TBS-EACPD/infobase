import { ensure_loaded } from '../../core/lazy_loader.js';
import { StandardRouteContainer } from '../../core/NavComponents.js';
import { SpinnerWrapper } from '../../util_components';
import { text_maker } from "../../models/text";

import { BudgetMeasuresTop } from './BudgetMeasuresTop.js';
import { BudgetMeasuresControls } from './BudgetMeasuresControls.js';
import { BudgetMeasuresPartition } from './BudgetMeasuresPartition.js';

const first_column_options = [
  {
    id: "dept",
    display: text_maker("by") + " " + text_maker("org"),
  },
  {
    id: "budget-measure",
    display: text_maker("by") + " " + text_maker("budget_measure"),
  },
];

const first_column_ids =  _.map(first_column_options, option => option.id );

const validate_first_column_route_param = (first_column, history) => {
  if ( _.indexOf(first_column_ids, first_column) === -1 ){
    history.push(`/budget-measures/${first_column_options[0].id}`);
    return false;
  } else {
    return true;
  }
}

export class BudgetMeasuresRoute extends React.Component {
  constructor(){
    super();
    this.state = {loading: true};
  }
  componentWillMount(){
    validate_first_column_route_param(this.props.match.params.first_column, this.props.history);
  }
  shouldComponentUpdate(nextProps){
    return validate_first_column_route_param(nextProps.match.params.first_column, this.props.history);
  }
  componentDidMount(){
    ensure_loaded({
      subject_name: 'BudgetMeasure',
    }).then( () => {
      this.setState({loading: false});
    });
  }
  render(){
    const first_column = this.props.match.params.first_column;

    return (
      <StandardRouteContainer
        ref = "container"
        title = { text_maker("budget_measures") }
        description = { "TODO" }
        breadcrumbs = { [text_maker("budget_measures")] }
        route_key = "budget-measures"
      >
        <h1>
          {text_maker("budget_measures")}
        </h1>
        { this.state.loading && <SpinnerWrapper ref="spinner" scale = { 4 } /> }
        { !this.state.loading && !window.is_a11y_mode &&
          <div className = "budget-measures">
            <BudgetMeasuresTop/>
            <BudgetMeasuresControls 
              first_column = { first_column } 
              history = { this.props.history } 
              items = { first_column_options }
            />
            <BudgetMeasuresPartition first_column = { first_column } />
          </div>
        }
        { !this.state.loading && window.is_a11y_mode &&
          <div className="budget-measures">
            <BudgetMeasuresTop/>
            {
              // TODO a11y presentation of data, probably just a table, but might require 
              // controls to match alternate versions available in the diagram?
            }
          </div>
        }
      </StandardRouteContainer>
    );
  }
}