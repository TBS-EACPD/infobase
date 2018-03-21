import { ensure_loaded } from '../../core/lazy_loader.js';
import { StandardRouteContainer } from '../../core/NavComponents.js';
import { SpinnerWrapper } from '../../util_components';
import { text_maker } from "../../models/text";

export class BudgetMeasuresRoute extends React.Component {
  constructor(){
    super()
    this.state = {loading: true};
  }
  componentDidMount(){
    ensure_loaded({
      subject_name: 'BudgetMeasure',
    }).then( () => {
      this.setState({loading: false});
    });
  }
  render(){
    return (
      <StandardRouteContainer
        ref="container"
        title={text_maker("budget_measures")}
        description={"TODO"}
        breadcrumbs={[text_maker("budget_measures")]}
        route_key="partition"
      >
        { this.state.loading && <SpinnerWrapper ref="spinner" scale={4} /> }
        { !this.state.loading && 
          <div> 
            {"Test"} 
          </div>
        }
      </StandardRouteContainer>
    );
  }
}  