import './BudgetMeasuresControls.scss';
import { Fragment } from 'react';

import { 
  text_maker,
  TextMaker,
} from './budget_measure_text_provider.js';
import { 
  LabeledBox,
  RadioButtons,
  DebouncedTextInput,
  FilterTable,
} from '../../util_components.js';

import { Subject } from '../../models/subject';
import { businessConstants } from '../../models/businessConstants.js';

const { BudgetMeasure } = Subject;
const {
  budget_chapters,
  budget_values,
} = businessConstants;

const budget_value_options = [
  {
    id: "overview",
    display: text_maker("funding_overview"),
  },
  ..._.map(
    budget_values, 
    (value, key) => ({ id: key, display: value.text })
  ),
];

export class BudgetMeasuresControls extends React.Component {
  constructor(){
    super();
  }
  render(){
    const {
      selected_value,
      first_column,
      history,
      group_by_items,
      filtered_chapter_keys,
      setFilteredChapterKeysCallback,
      filter_string,
      setFilterString,
    } = this.props;
    
    const all_chapter_keys = _.keys(budget_chapters);
    const active_list = _.xor(all_chapter_keys, filtered_chapter_keys);

    // For selected_values other than funding, only show counts for measures with data for that selected_value
    const measure_counts_by_chapter_key = _.chain( BudgetMeasure.get_all() )
      .filter( measure => selected_value === "funding" || _.some(measure.data, (row) => row[selected_value] !== 0) )
      .countBy("chapter_key")
      .value();

    const update_filtered_chapter_keys = (chapter_key) => {

      const new_filtered_chapter_keys = filtered_chapter_keys.length === 0 ?
        _.xor(all_chapter_keys, [chapter_key]) :
        _.xor(filtered_chapter_keys, [chapter_key]);

      if (new_filtered_chapter_keys.length === all_chapter_keys.length){
        // Don't let everything be filtered at once
        // User likely wanted un-do filtering in this case, so just clear filtered items
        setFilteredChapterKeysCallback([]);
      } else {
        setFilteredChapterKeysCallback(new_filtered_chapter_keys);
      }
    }

    const update_filter_string = (filter_string) => {
      if (filter_string === ""){
        setFilterString(false);
      } else {
        setFilterString(filter_string);
      }
    }

    return (
      <div className="budget-measures-partition-controls">
        <LabeledBox 
          label = { <TextMaker text_key="budget_measure_display_value_label" /> }
          content = {
            <div className="centerer">
              <RadioButtons
                options = { _.map( budget_value_options, ({id, display }) => ({ id, display, active: id === selected_value }) ) }
                onChange = { id => {
                  const new_path = `/budget-measures/${first_column}/${id}`;
                  if ( history.location.pathname !== new_path ){
                    // the first_column prop, and thus this button's active id, is updated through this route push
                    history.push(new_path);
                  }
                }}
              />
            </div>
          }
        />
        { selected_value !== "overview" &&
          <LabeledBox 
            label = { <TextMaker text_key="budget_measure_group_by_label" /> }
            content = {
              <div className="centerer">
                <RadioButtons
                  options = { _.map( group_by_items, ({id, display }) => ({ id, display, active: id === first_column }) ) }
                  onChange = { id => {
                    const new_path = `/budget-measures/${id}/${selected_value}`;
                    if ( history.location.pathname !== new_path ){
                      // the first_column prop, and thus this button's active id, is updated through this route push
                      history.push(new_path);
                    }
                  }}
                />
              </div>
            }
          />
        }
        <LabeledBox 
          label = { <TextMaker text_key="budget_measure_filter_by_chapter_key_label" /> }
          content = {
            <div>
              <div className="centerer" style={{fontSize: "26px"}}>
                <TextMaker text_key="budget_chapters" />
              </div>
              <div className="chapter-key-table">
                <FilterTable
                  items={
                    _.chain(all_chapter_keys)
                      .map( chapter_key => ({
                        chapter_key, 
                        count: measure_counts_by_chapter_key[chapter_key] || 0,
                      }) )
                      .map( ({chapter_key, count }) => ({
                        key: chapter_key,
                        active: _.includes(active_list, chapter_key),
                        count: (
                          <Fragment>
                            {count}
                            <br/>
                            { text_maker("budget_measures_short") }
                          </Fragment>
                        ),
                        text: budget_chapters[chapter_key].text,
                      }) )
                      .value()
                  }
                  item_component_order={ ["text", "count"] }
                  click_callback={ update_filtered_chapter_keys }
                />
              </div>
              <div className="centerer" style={{fontSize: "26px"}}>
                <TextMaker text_key="budget_measure_filter_by_name_and_desc_label" />
              </div>
              <div className="budget-measures-search-box">
                <DebouncedTextInput
                  placeHolder = { text_maker("budget_measure_filter_by_name_and_desc_placeholder") }
                  defaultValue = { filter_string }
                  updateCallback = { update_filter_string.bind(this) }
                />
              </div>
            </div>
          }
        />
      </div>
    );
  }
}