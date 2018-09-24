import 'react-bootstrap-typeahead/css/Typeahead.css';
// Uncomment followingl ine once we've moved to bootstrap4
// import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';
import './GeneralizedSearch.scss';

import { trivial_text_maker } from '../models/text.js';

import { 
  Typeahead,
  Highlighter,
  Menu,
  MenuItem,
} from 'react-bootstrap-typeahead';

export class GeneralizedSearch extends React.component {
  render(){
    const {
      placeholder,
      minLength,
      large, 
      onNewQuery,
      onSelect, 
      search_configs,
    } = this.props;
    
    const bootstrapSize = large ? "large" : "small";
    const debouncedOnQueryCallback = _.isFunction(onNewQuery) ? _.debounce(onNewQuery, 750) : _.noop;

    // do stuff to get data, groupings, and filter options by grouping out of search_configs here
    const groups = []; // one grouping per search_config entry, identify by index? 

    const filterBy = []; // need to build filter a filter function here that is smart about the different groupings in search_config

    const all_data = []; // all data from search_configs, paired with group header so filterBy can tell how to filter it

   

    return (
      <Typeahead
        emptyLabel = { "TODO: need text key for no matches found" }
        placeholder
        minLength
        bsSize = { bootstrapSize }

        // API's a bit vague here, this onChange is "on change" in selection of options from the typeahead dropdown. Selected is an array of selected items,
        // but GeneralizedSearch will only ever use single selection, so just picking the first item and passing it to onSelect is fine
        onChange = { (selected) => selected.length && onSelect(selected[0]) } 

        onInputChange = { (text) => debouncedOnQueryCallback(text) } // this is on change to the input in the text box

        filterBy

        // API's a bit vague here, options is the data to search over, not a config object
        options = { all_data } 

        renderMenu = {
          (results, menuProps) => {
            // map results (options matching query) to array of react components, including group headers and MenuItem components
            const result_items = [];

            return <Menu {...menuProps}>{result_items}</Menu>;
          }
        }
      />
    );
  }
}

GeneralizedSearch.defaultProps = {
  minLength: 3,
  placeholder: trivial_text_maker("org_search"),
}