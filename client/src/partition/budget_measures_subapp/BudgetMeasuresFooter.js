import './BudgetMeasuresFooter.scss';

import { TextMaker } from './budget_measure_text_provider.js';

import { 
  LabeledBox, 
  FancyUL,
} from '../../util_components.js';

import { sources } from '../../metadata/data_sources.js';

const { BUDGET: budget_source } = sources;

const FancyULBudgetSourceRow = (source_item, open_data_link) => (
  <span key={source_item.id} className="fancy-ul-span-flex">
    <a href={"#metadata/BUDGET"}>
      {source_item.text}
    </a>
    <a 
      target="_blank" 
      rel="noopener noreferrer"
      className="btn btn-xs btn-ib-primary btn-responsive-fixed-width" 
      href={open_data_link}>
      <TextMaker text_key="open_data_link"/>
    </a>
  </span>
);

export class BudgetMeasuresFooter extends React.Component {
  render(){
    const open_data_link = budget_source.open_data[lang];
    
    return (
      <div className="budget-measures-partition-footer">
        <LabeledBox 
          label = { <TextMaker text_key="data_sources" /> }
          content = {
            <div className="budget-measure-fancy-ul-container">
              <FancyUL>
                {
                  _.map(
                    budget_source.items(),
                    (source_item) => FancyULBudgetSourceRow(source_item, open_data_link)
                  )
                }
              </FancyUL>
            </div>
          }
        />
      </div>
    );
  }
}