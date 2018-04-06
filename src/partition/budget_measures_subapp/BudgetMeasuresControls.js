import './BudgetMeasuresControls.scss';
import './BudgetMeasuresControls.ib.yaml';

import { 
  LabeledBox,
  TextMaker,
  RadioButtons,
} from '../../util_components.js';

export function BudgetMeasuresControls({ first_column, history, items }){
  return (
    <div className="budget-measures-partition-controls">
      <LabeledBox 
        label={ <TextMaker text_key="budget_measure_group_by_label" /> }
        content={
          <div className="centerer">
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
        }
      />
    </div>
  );
}