import './BudgetMeasuresControls.scss';

import { RadioButtons } from '../../util_components.js';

export class BudgetMeasuresControls extends React.Component {
  constructor(){
    super();
  }
  render(){
    const {
      first_column,
      history,
      items,
    } = this.props;

    return (
      <div className="budget-measures-partition-controls">
        <RadioButtons
          options={ _.map( items, ({id, display }) => ({ id, display, active: id === first_column }) ) }
          onChange={ id => {
            const new_path = `/budget-measures/${id}`;
            if ( history.location.pathname !== new_path ){
              // the first_column prop, and thus this button's active id, is updated through this route push
              history.push(new_path);
            }
          }}
        />
      </div>
    );
  }
}