import './BudgetMeasuresControls.scss';
import './BudgetMeasuresControls.ib.yaml';

import classNames from 'classnames';

import { text_maker } from "../../models/text";
import { 
  LabeledBox,
  TextMaker,
  RadioButtons,
  DebouncedTextInput,
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
      setFilteredChapterKeysCallback,
      filter_string,
      setFilterString,
    } = this.props;
    
    const update_filtered_chapter_keys = (filtered_chapter_keys, chapter_key) => {
      const all_chapter_keys = _.keys(budget_chapters);

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
      setFilterString(filter_string);
    }

    const active_list = _.xor(_.keys(budget_chapters), filtered_chapter_keys);

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
            <div>
              <div className="centerer" style={{fontSize: "26px"}}>
                <TextMaker text_key="budget_chapters" />
              </div>
              <div className="chapter-key-table">
                {
                  _.chain(this.state.chapter_keys)
                    .map( chapter_key => ({
                      chapter_key, 
                      count: this.state.measure_counts_by_chapter_key[chapter_key] || 0,
                    }) )
                    .map( ({chapter_key, count }) =>
                      <button
                        aria-pressed={ _.includes(active_list, chapter_key) }
                        onClick={ () => update_filtered_chapter_keys(filtered_chapter_keys, chapter_key) }
                        className={ classNames("chapter-key-table__item", _.includes(active_list, chapter_key) && "chapter-key-table__item--active" ) }
                        key={chapter_key}
                      >
                        <div 
                          className="chapter-key-table__eye"
                          style={{
                            visibility: filtered_chapter_keys.length !== 0 ? "visible" : "hidden",
                          }}
                        >
                          <span
                            className={
                              "glyphicon glyphicon-eye-" + 
                                (_.includes(active_list, chapter_key) ?
                                  "open" : 
                                  "close")
                            }
                          ></span>
                        </div>
                        <div className="chapter-key-table__word">
                          <span className="link-unstyled">
                            {budget_chapters[chapter_key].text}
                          </span>
                        </div>
                        <div className="chapter-key-table__icon-count">
                          <span className="chapter-key-table__count">
                            {count} <br/> { text_maker("budget_measures_short") }
                          </span>
                        </div>
                      </button>
                    )
                    .value()
                }
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