import 'react-bootstrap-typeahead/css/Typeahead.css';
// Uncomment followingl ine once we've moved to bootstrap4
// import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';
import './BaseTypeahead.scss';

import { 
  Typeahead,
  Highlighter,
  Menu,
  MenuItem,
} from 'react-bootstrap-typeahead';

import { get_static_url } from '../core/request_utils.js';
import { trivial_text_maker } from '../models/text.js';

export class BaseTypeahead extends React.Component {
  constructor(){
    super();

    // Hacky, but had to implement pagination at the filtering level due to this typeahead having a really rigid API.
    // filtered_counter is used to make sure only items "on the page" make it through the filter, it is reset to 0 every 
    // time the menu renders (which should always happen right after the filtering is done)
    this.filtered_counter = 0;
    this.pagination_index = 0;
  }
  componentDidMount(){
    this.typeahead.componentNode
      .querySelector(".rbt-input-hint-container")
      .insertAdjacentHTML(
        'beforeend', 
        `<div class="search-icon-container">
          <span 
            aria-hidden="true"
          >
          <img src="${get_static_url("svg/search.svg")}" style="width:30px; height:30px;" />
          </span>
        </div>`
      );
  }
  render(){
    const {
      pagination_size,
      placeholder,
      minLength,
      large, 
      onNewQuery,
      onSelect, 
      search_configs,
    } = this.props;
    
    const bootstrapSize = large ? "large" : "small";

    const config_groups = _.map(
      search_configs,
      (search_config, ix) => ({
        group_header: search_config.header_function(),
        group_filter: search_config.filter,
      })
    );

    const all_options = _.flatMap( 
      search_configs,
      (search_config, ix) => _.map(
        search_config.get_data(),
        data => ({
          data,
          name: search_config.name_function(data),
          menu_content: (search) => (
            _.isFunction(search_config.menu_content_function) ?
              search_config.menu_content_function(data, search) :
              (
                <Highlighter search={search}>
                  {search_config.name_function(data)}
                </Highlighter>
              )
          ),
          config_group_index: ix,
        })
      )
    );
    
    // Didn't like the default pagination, but due to API rigidness I had to implement my own at the filtering level
    const paginate_results = () => {
      const page_start = pagination_size * this.pagination_index;
      const page_end = page_start + pagination_size;
      const is_on_displayed_page = !(this.filtered_counter < page_start || this.filtered_counter >= page_end);

      this.filtered_counter++;

      return is_on_displayed_page;
    }
    
    const filterBy = (option, props) => {
      const query = props.text;
      const group_filter = config_groups[option.config_group_index].group_filter;
      const query_matches = group_filter(query, option.data);

      if (query_matches){
        return paginate_results();
      } else {
        return false
      }
    };

    return (
      <Typeahead
        ref={(ref) => this.typeahead = ref}
        labelKey = "name"
        emptyLabel = { 'TODO: need text key for "no matches found"' }
        paginate = { false }

        placeholder = { placeholder }
        minLength = { minLength }
        bsSize = { bootstrapSize }

        // API's a bit vague here, this onChange is "on change" set of options selected from the typeahead dropdown. Selected is an array of selected items,
        // but BaseTypeahead will only ever use single selection, so just picking the first (and, we'd expect, only) item and passing it to onSelect is fine
        onChange = {
          (selected) => {
            const anything_selected = !_.isEmpty(selected);
            if (anything_selected){
              this.pagination_index = 0;
              
              if (anything_selected){
                this.typeahead.getInstance().clear();
              }

              if ( anything_selected && _.isFunction(onSelect)){
                onSelect(selected[0].data);
              }
            }
          }
        } 
        
        // This is "on change" to the input in the text box
        onInputChange = {
          _.debounce(
            (text) => {
              this.pagination_index = 0; // Reset pagination index
              this.filtered_counter = 0; // To be safe, reset the filtered counter here too
              onNewQuery(text);
            },
            500
          )
        }

        onPaginate = {
          (e) => {
            if ( e.target.parentElement.className.includes("previous") ){
              this.pagination_index--;
            } else if ( e.target.parentElement.className.includes("next") ){
              this.pagination_index++;
            }
            this.typeahead.getInstance().blur();
            this.typeahead.getInstance().focus();
          }
        }

        // API's a bit vague here, options is the data to search over, not a config object
        options = { all_options } 

        filterBy = { filterBy }
        renderMenu = {
          (results, menuProps) => {
            const total_query_matches = this.filtered_counter + results.length;

            // renderMenu is always called right after filtering is finished,
            // a bit hacky, but need to reset the filtered_counter here
            this.filtered_counter = 0;

            return (
              <Menu {...menuProps}>
                {
                  _.chain(results)
                    .groupBy("config_group_index")
                    .thru(
                      (grouped_results) => {
                        const needs_pagination_up_control = this.pagination_index > 0;
                        const needs_pagination_down_control = (this.pagination_index * pagination_size) < total_query_matches;

                        const pagination_down_index = needs_pagination_up_control ? results.length + 1 : results.length; 

                        let index_key_counter = needs_pagination_up_control ? 1 : 0;
                        return [
                          needs_pagination_up_control && (
                            <MenuItem 
                              key={0} 
                              position={0} 
                              option={{
                                paginationOption: true,
                                paginate_direction: "previous",
                                name: "TODO, same as display text",
                              }}
                              className="rbt-menu-pagination-option rbt-menu-pagination-option--previous"
                            >
                              { "TODO: show previous" }
                            </MenuItem>
                          ),
                          ..._.flatMap(
                            grouped_results,
                            (results, group_index) => [
                              <Menu.Header key={`header-${group_index}`}>
                                {config_groups[group_index].group_header}
                              </Menu.Header>,
                              ..._.map(
                                results,
                                (result) => {
                                  const index = index_key_counter++;
                                  return (
                                    <MenuItem key={index} position={index} option={result}>
                                      { result.menu_content(menuProps.text) }
                                    </MenuItem>
                                  );
                                }
                              ),
                            ]
                          ),
                          needs_pagination_down_control && (
                            <MenuItem
                              key={pagination_down_index}
                              position={pagination_down_index}
                              option={{
                                paginationOption: true,
                                paginate_direction: "next",
                                name: "TODO: same as display text",
                              }}
                              className="rbt-menu-pagination-option rbt-menu-pagination-option--next"
                            >
                              { "TODO: show next" }
                            </MenuItem>
                          ),
                        ]
                      }
                    )
                    .value()
                }
              </Menu>
            );
          }
        }
      />
    );
  }
}

BaseTypeahead.defaultProps = {
  pagination_size: 25,
  placeholder: trivial_text_maker("org_search"),
  minLength: 3,
  large: true,
  onNewQuery: _.noop,
}