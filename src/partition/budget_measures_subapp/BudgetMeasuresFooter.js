import './BudgetMeasuresFooter.scss';

import {
  text_maker,
  TextMaker,
} from './budget_measure_text_provider.js';

import { LabeledBox } from '../../util_components.js';

export class BudgetMeasuresFooter extends React.Component {
  render(){
    return (
      <div className="budget-measures-partition-footer">
        <LabeledBox 
          label = { <TextMaker text_key="data_sources" /> }
          content = {
            <div>
              { "TODO" }
            </div>
          }
        />
      </div>
    );
  }
}