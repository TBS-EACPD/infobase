import MediaQuery from "react-responsive";

import { DropdownMenu } from "src/components/index.js";

import { log_standard_event } from "../../core/analytics.js";
import { breakpoints } from "../../core/breakpoint_defs.js";

import { IconFilter } from "../../icons/icons.js";
import { create_text_maker } from "../../models/text.js";

import { get_static_url } from "../../request_utils.js";

import { InfoBaseHighlighter } from "../search_utils.js";

import { TypeaheadMenu } from "./TypeaheadMenu.js";

import text from "./Typeahead.yaml";

import "./Typeahead.scss";

const text_maker = create_text_maker(text);

export class Typeahead extends React.Component {
  state = {
    search_text: "",
    can_show_menu: false,
  };

  constructor(props) {
    super(props);

    this.typeaheadRef = React.createRef();
    this.rbtRef = React.createRef();
    this.firstMenuItemRef = React.createRef();
  }

  on_select_item = (selected) => {
    const { onSelect } = this.props;

    const anything_selected = !_.isEmpty(selected);
    if (anything_selected) {
      this.setState({ search_text: "" });

      if (_.isFunction(onSelect)) {
        onSelect(selected.data);
      }

      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: `TYPEAHEAD_SEARCH_SELECT`,
        MISC2: `selected: ${selected.name}`,
      });
    }
  };

  handle_key_down = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.setState({ can_show_menu: true }, () => {
        this.firstMenuItemRef.current && this.firstMenuItemRef.current.focus();
      });
    }
  };

  hide_menu = () => this.setState({ can_show_menu: false });

  render() {
    const {
      placeholder,
      minLength,
      filter_content,
      pagination_size,
      search_configs,
      onNewQuery,
      is_original_filter,
    } = this.props;

    const { search_text, can_show_menu } = this.state;

    const debounceOnNewQuery = _.debounce((query) => {
      onNewQuery();
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: `TYPEAHEAD_SEARCH_QUERY`,
        MISC2: `query: ${query}, search_configs: ${_.map(
          search_configs,
          "config_name"
        )}`,
      });
    }, 500);

    const update_search_text = (event) => {
      const text = _.trimStart(event.target.value); //prevent empty searching that will show all results
      debounceOnNewQuery(text);
      this.setState({ search_text: text });
    };

    const config_groups = _.map(search_configs, (search_config, ix) => ({
      group_header: search_config.header_function(),
      group_filter: search_config.filter,
    }));

    // Options includes placeholders for pagination items, because the number of results passed to renderMenu
    // (ie. that get through matches_query) needs to actually match the number of lis ultimately rendered, can't
    // just insert the pagination items when renderMenu is called
    const all_options = [
      ..._.flatMap(search_configs, (search_config, ix) =>
        _.map(search_config.get_data(), (data) => ({
          data,
          name: search_config.name_function(data),
          menu_content: (search) =>
            _.isFunction(search_config.menu_content_function) ? (
              search_config.menu_content_function(data, search)
            ) : (
              <InfoBaseHighlighter
                search={search}
                content={search_config.name_function(data)}
              />
            ),
          config_group_index: ix,
        }))
      ),
    ];

    const matches_query = (option) => {
      const { search_text } = this.state;
      const group_filter =
        config_groups[option.config_group_index].group_filter;
      const query_matches = group_filter(search_text, option.data);

      return query_matches;
    };

    const queried_results = _.filter(
      all_options,
      (res) => matches_query(res) && !_.isUndefined(res.config_group_index)
    );

    const menu_props = {
      queried_results,
      pagination_size,
      search_text,
      config_groups,
      on_select_item: this.on_select_item,
      hide_menu: this.hide_menu,
    };

    return (
      <div className="rbt" style={{ position: "relative" }} ref={this.rbtRef}>
        <div className="search-bar">
          <div className="search-icon-container">
            <span aria-hidden="true">
              <img
                src={`${get_static_url("svg/search.svg")}`}
                style={{ width: "30px", height: "30px" }}
              />
            </span>
          </div>
          {filter_content && (
            <div style={{ order: 2 }}>
              <DropdownMenu
                dropdown_trigger_txt={
                  <div
                    style={{
                      textAlign: "start",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                    }}
                  >
                    <MediaQuery minWidth={breakpoints.minSmallDevice}>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          display: "inline-block",
                          marginRight: "1.5rem",
                        }}
                      >
                        <IconFilter
                          height="5px"
                          width="5px"
                          vertical_align="top"
                          alternate_color="false"
                        />
                      </div>
                    </MediaQuery>
                    <span>
                      {is_original_filter
                        ? text_maker("add_filter")
                        : text_maker("edit_filter")}
                    </span>
                  </div>
                }
                dropdown_a11y_txt={
                  is_original_filter
                    ? text_maker("add_filter")
                    : text_maker("edit_filter")
                }
                opened_button_class_name={"btn-ib-light--reversed--with-icon"}
                closed_button_class_name={"btn-ib-light--with-icon"}
                dropdown_content_class_name="no-right"
                dropdown_content={filter_content}
              />
            </div>
          )}
          <input
            id="rbt-search"
            style={{ width: "100%", order: 1 }}
            placeholder={placeholder}
            aria-label={placeholder}
            onChange={update_search_text}
            ref={this.typeaheadRef}
            onKeyDown={this.handleKeyDown}
            value={search_text}
            onFocus={() => this.setState({ can_show_menu: true })}
            onKeyDown={this.handle_key_down}
          />
        </div>
        {search_text.length >= minLength && can_show_menu && (
          <TypeaheadMenu
            {...menu_props}
            rbtRef={this.rbtRef}
            ref={this.firstMenuItemRef}
          />
        )}
      </div>
    );
  }
}

Typeahead.defaultProps = {
  placeholder: text_maker("org_search"),
  minLength: 3,
  onNewQuery: _.noop,
};
