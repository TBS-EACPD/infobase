import { ensure_loaded } from '../../core/lazy_loader.js';
import { StandardRouteContainer } from '../../core/NavComponents.js';
import { SpinnerWrapper } from '../../util_components';
import { text_maker } from "../../models/text";

import { BudgetMeasuresTop } from './BudgetMeasuresTop.js';
import { BudgetMeasuresControls } from './BudgetMeasuresControls.js';
import { BudgetMeasuresPartition } from './BudgetMeasuresPartition.js';

export class BudgetMeasuresRoute extends React.Component {
  constructor(){
    super();
    this.state = {loading: true};
  }
  componentWillMount(){
    //const first_column = this.props.match.params.first_column;
    //if (first_column !== "TODO: check for valid first column option"){
    //  this.props.history.push('/budget-measures/TODO default column route')
    //}
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
        ref="container"
        title={text_maker("budget_measures")}
        description={"TODO"}
        breadcrumbs={[text_maker("budget_measures")]}
        route_key="budget-measures"
      >
        { this.state.loading && <SpinnerWrapper ref="spinner" scale={4} /> }
        { !this.state.loading &&
          <div className="budget-measures">
            <BudgetMeasuresTop/>
            <div className="budget-measures-partition-and-controls">
              <BudgetMeasuresControls first_column={first_column} history={this.props.history} />
              <BudgetMeasuresPartition first_column={first_column} />
            </div>
          </div>
        }
      </StandardRouteContainer>
    );
  }
}