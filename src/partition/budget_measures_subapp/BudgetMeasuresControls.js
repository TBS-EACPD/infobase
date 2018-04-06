import './BudgetMeasuresControls.scss';
import './BudgetMeasuresControls.ib.yaml';

import { 
  LabeledBox,
  TextMaker,
  RadioButtons,
} from '../../util_components.js';

import * as Subject from '../../models/subject';
import * as businessConstants from '../../models/businessConstants.yaml';

const { BudgetMeasure } = Subject;
const { budget_chapters } = businessConstants;

export class BudgetMeasuresControls extends React.Component {
  constructor(){
    super();
    this.state = {
      chapter_keys: _.keys(budget_chapters),
      measure_counts_by_chapter_key: _.countBy(BudgetMeasure.get_all(), "chapter_key"),
    };
  }
  render(){
    const { 
      first_column,
      history,
      group_by_items,
      filtered_chapter_keys,
      toggleFilteredChapterKeysCallback
    } = this.props;
    
    return (
      <div className="budget-measures-partition-controls">
        <LabeledBox 
          label = { <TextMaker text_key="budget_measure_group_by_label" /> }
          content = {
            <div className="centerer">
              <RadioButtons
                options = { _.map( group_by_items, ({id, display }) => ({ id, display, active: id === first_column }) ) }
                onChange = { id => {
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
        <LabeledBox 
          label = { <TextMaker text_key="budget_measure_filter_by_chapter_key_label" /> }
          content = {
            "todo"
          }
        />
      </div>
    );
  }
}