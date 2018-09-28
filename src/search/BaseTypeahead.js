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

import text from "./BaseTypeahead.yaml";
import { create_text_maker } from '../models/text.js';
const text_maker = create_text_maker(text);

export class BaseTypeahead extends React.Component {
  constructor(){
    super();

    // Hacky, but had to implement pagination at the filtering level due to this typeahead having a really rigid API.
    // query_matched_counter is used to make sure only items "on the page" make it through the filter, it is reset to 0 every 
    // time the menu renders (which should always happen right after the filtering is done)
    this.reset_pagination();
  }
  reset_pagination(){
    this.query_matched_counter = 0;
    this.pagination_index = 0;
  }
  refresh_dropdown_menu(){
    if (this.typeahead){
      this.typeahead.getInstance().blur();
      this.typeahead.getInstance().focus();
    }
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

    const debounceOnNewQuery = _.debounce(onNewQuery, 500);

    const config_groups = _.map(
      search_configs,
      (search_config, ix) => ({
        group_header: search_config.header_function(),
        group_filter: search_config.filter,
      })
    );

    // Options includes placeholders for pagination items, because the number of results passed to renderMenu
    // (ie. that get through filterBy) needs to actually match the number of MenuItems ultimately rendered, can't 
    // just insert the pagination items when renderMenu is called
    const all_options = [
      {
        pagination_placeholder: true,
        paginate_direction: "previous",
      },
      ..._.flatMap(
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
      ),
      {
        pagination_placeholder: true,
        paginate_direction: "next",
      },
    ];
    
    // Didn't like the default pagination, but due to API rigidness I had to implement my own at the filtering level
    const paginate_results = () => {
      const page_start = pagination_size * this.pagination_index;
      const page_end = page_start + pagination_size;
      const is_on_displayed_page = !(this.query_matched_counter < page_start || this.query_matched_counter >= page_end);

      this.query_matched_counter++;

      return is_on_displayed_page;
    }
    
    const filterBy = (option, props) => {
      if (option.pagination_placeholder){
        if (option.paginate_direction === "previous"){
          return this.pagination_index > 0;
        } else if (option.paginate_direction === "next") {
          // This should be the last item filtered, as long as none of the data being queried looks just like a paginate option
          // A bit hacky, but need to reset the query_matched_counter here so we can be sure the next filter pass works right
          this.query_matched_counter = 0;

          return true;// can't yet tell if next button's needed at this point, so always pass it's placeholder through
        }
      }

      const query = props.text;
      const group_filter = config_groups[option.config_group_index].group_filter;
      const query_matches = group_filter(query, option.data);

      if (query_matches){
        return paginate_results();
      } else {
        return false;
      }
    };

    return (
      <Typeahead
        ref = { (ref) => this.typeahead = ref }
        labelKey = "name"
        paginate = { false } // Turn off built in pagination

        placeholder = { placeholder }
        minLength = { minLength }
        bsSize = { bootstrapSize }  
        options = { all_options } // API's a bit vague here, options is the data to search over, not a config object
        filterBy = { filterBy }

        // API's a bit vague here, this onChange is "on change" set of options selected from the typeahead dropdown. Selected is an array of selected items,
        // but BaseTypeahead will only ever use single selection, so just picking the first (and, we'd expect, only) item and passing it to onSelect is fine
        onChange = {
          (selected) => {
            const anything_selected = !_.isEmpty(selected);
            if (anything_selected){
              this.reset_pagination();

              this.typeahead.getInstance().clear();

              if ( _.isFunction(onSelect) ){
                onSelect(selected[0].data);
              }
            }
          }
        } 
        
        // This is "on change" to the input in the text box
        onInputChange = {
          (text) => {
            this.reset_pagination();
            this.refresh_dropdown_menu();
            debounceOnNewQuery(text)
          }
        }

        // receives events selecting an option with the pagination_placeholder: true property
        onPaginate = {
          (e) => {
            let selected_item;

            if (e.type === "click"){
              selected_item = e.target.parentElement;
            } else {
              selected_item = this.typeahead.componentNode.querySelector("li.active");
            }

            if (selected_item){
              if ( selected_item.className.includes("previous") ){
                this.pagination_index--;
              } else if ( selected_item.className.includes("next") ){
                this.pagination_index++;
              }
              this.refresh_dropdown_menu();
            }
          }
        }

        renderMenu = {
          (results, menuProps) => {
            const filtered_results = _.filter(results, (option) => !_.isUndefined(option.config_group_index) );

            if ( _.isEmpty(filtered_results) ){
              return (
                <Menu {...menuProps}>
                  <li className="disabled">
                    <a className="dropdown-item disabled">
                      { text_maker("no_matches_found") }
                    </a>
                  </li>
                </Menu>
              );
            } else {
              return (
                <Menu {...menuProps}>
                  {
                    _.chain(filtered_results)
                      .groupBy("config_group_index")
                      .thru(
                        (grouped_results) => {
                          const needs_pagination_up_control = this.pagination_index > 0;
                          const needs_pagination_down_control = (this.pagination_index * pagination_size) < filtered_results.length;
  
                          const pagination_down_index = needs_pagination_up_control ? filtered_results.length + 1 : filtered_results.length; 
  
                          let index_key_counter = needs_pagination_up_control ? 1 : 0;
                          return [
                            needs_pagination_up_control && (
                              <MenuItem 
                                key={0} 
                                position={0} 
                                option={{
                                  paginationOption: true,
                                  paginate_direction: "previous",
                                  name: text_maker("paginate_previous"),
                                }}
                                className="rbt-menu-pagination-option rbt-menu-pagination-option--previous"
                              >
                                { text_maker("paginate_previous") }
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
                                  name: text_maker("paginate_next"),
                                }}
                                className="rbt-menu-pagination-option rbt-menu-pagination-option--next"
                              >
                                { text_maker("paginate_next") }
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
        }
      />
    );
  }
}

BaseTypeahead.defaultProps = {
  pagination_size: 25,
  placeholder: text_maker("org_search"),
  minLength: 3,
  large: true,
  onNewQuery: _.noop,
}