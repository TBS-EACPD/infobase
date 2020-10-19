import {
  OverlayTrigger,
  Popover,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import MediaQuery from "react-responsive";

import { TM } from "../../components/TextMaker.js";
import { log_standard_event } from "../../core/analytics.js";
import { breakpoints } from "../../core/breakpoint_defs.js";

import { IconFilter } from "../../icons/icons.js";
import { create_text_maker } from "../../models/text.js";

import { get_static_url } from "../../request_utils.js";

import { InfoBaseHighlighter } from "../search_utils.js";

import "./Typeahead.scss";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);
const TextMaker = (props) => <TM tmf={text_maker} {...props} />;

export class Typeahead extends React.Component {
  state = {
    search_text: "",
    pagination_index: 0,
  };

  constructor(props) {
    super(props);

    this.typeaheadRef = React.createRef();
  }

  on_select_item = (selected) => {
    const { onSelect } = this.props;

    const anything_selected = !_.isEmpty(selected);
    if (anything_selected) {
      this.setState({ search_text: "", pagination_index: 0 });

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

  render() {
    const {
      placeholder,
      minLength,
      filter_content,
      pagination_size,
      search_configs,
      onNewQuery,
    } = this.props;

    const { search_text, cursor, pagination_index } = this.state;

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
      this.setState({ search_text: text, pagination_index: 0 });
    };

    const config_groups = _.map(search_configs, (search_config, ix) => ({
      group_header: search_config.header_function(),
      group_filter: search_config.filter,
    }));

    // Options includes placeholders for pagination items, because the number of results passed to renderMenu
    // (ie. that get through matches_query) needs to actually match the number of lis ultimately rendered, can't
    // just insert the pagination items when renderMenu is called
    const all_options = [
      {
        pagination_placeholder: true,
        paginate_direction: "previous",
      },
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
      {
        pagination_placeholder: true,
        paginate_direction: "next",
      },
    ];

    // Didn't like the default pagination, but due to API rigidness I had to implement my own at the filtering level
    const paginate_results = (option, index) => {
      if (option.pagination_placeholder) {
        if (option.paginate_direction === "previous") {
          return pagination_index > 0;
        } else if (option.paginate_direction === "next") {
          return true; // can't yet tell if next button's needed at this point, so always pass it's placeholder through
        }
      }
      const page_start = pagination_size * pagination_index;
      const page_end = page_start + pagination_size;
      const is_on_displayed_page = !(index < page_start || index >= page_end);

      return is_on_displayed_page;
    };

    const matches_query = (option) => {
      if (option.pagination_placeholder) {
        if (option.paginate_direction === "previous") {
          return pagination_index > 0;
        } else if (option.paginate_direction === "next") {
          return true; // can't yet tell if next button's needed at this point, so always pass it's placeholder through
        }
      }

      const query = this.state.search_text;
      const group_filter =
        config_groups[option.config_group_index].group_filter;
      const query_matches = group_filter(query, option.data);

      return query_matches;
    };

    const queried_results = _.filter(
      all_options,
      (res) => matches_query(res) && !_.isUndefined(res.config_group_index)
    );

    const paginated_results = _.filter(
      queried_results,
      (queried_result, index) => paginate_results(queried_result, index)
    );

    const menu = (() => {
      const page_range_start = pagination_index * pagination_size + 1;
      const page_range_end = page_range_start + paginated_results.length - 1;

      const total_matching_results = queried_results.length;

      const remaining_results =
        total_matching_results - (pagination_index + 1) * pagination_size;
      const next_page_size =
        remaining_results < pagination_size
          ? remaining_results
          : pagination_size;

      if (_.isEmpty(paginated_results)) {
        return (
          <ListGroup className="rbt-menu dropdown-menu show">
            <ListGroupItem disabled className="dropdown-item">
              {text_maker("no_matches_found")}
            </ListGroupItem>
          </ListGroup>
        );
      } else {
        return (
          <ListGroup className="rbt-menu dropdown-menu show">
            {_.chain(paginated_results)
              .groupBy("config_group_index")
              .thru((grouped_results) => {
                const needs_pagination_up_control = pagination_index > 0;
                const needs_pagination_down_control =
                  page_range_end < total_matching_results;

                const pagination_down_item_index = needs_pagination_up_control
                  ? paginated_results.length + 1
                  : paginated_results.length;

                let index_key_counter = needs_pagination_up_control ? 1 : 0;
                return [
                  <ListGroupItem
                    key={`header-pagination-info`}
                    className="dropdown-header"
                  >
                    <TextMaker
                      k="paginate_status"
                      args={{
                        page_range_start,
                        page_range_end,
                        total_matching_results,
                      }}
                    />
                  </ListGroupItem>,
                  needs_pagination_up_control && (
                    <ListGroupItem
                      key={0}
                      id={`rbt-menu-item-${pagination_down_item_index}`}
                      className="rbt-menu-pagination-option rbt-menu-pagination-option--previous dropdown-item"
                      onClick={(e) => {
                        this.setState((prev_state) => ({
                          pagination_index: prev_state.pagination_index - 1,
                        }));
                      }}
                    >
                      <span className="aria-hidden">▲</span>
                      <br />
                      <TextMaker
                        k="paginate_previous"
                        args={{ page_size: pagination_size }}
                      />
                    </ListGroupItem>
                  ),
                  ..._.flatMap(grouped_results, (results, group_index) => [
                    <ListGroupItem
                      key={`header-${group_index}`}
                      className="dropdown-header"
                    >
                      {config_groups[group_index].group_header}
                    </ListGroupItem>,
                    ..._.map(results, (result) => {
                      const index = index_key_counter++;
                      return (
                        <ListGroupItem
                          key={index}
                          id={`rbt-menu-item-${index}`}
                          role="option"
                          aria-selected
                          className="dropdown-item"
                          onClick={() => this.on_select_item(result)}
                        >
                          {result.menu_content(search_text)}
                        </ListGroupItem>
                      );
                    }),
                  ]),
                  needs_pagination_down_control && (
                    <ListGroupItem
                      key={pagination_down_item_index}
                      id={`rbt-menu-item-${pagination_down_item_index}`}
                      className="rbt-menu-pagination-option rbt-menu-pagination-option--next dropdown-item"
                      onClick={(e) => {
                        this.setState((prev_state) => ({
                          pagination_index: prev_state.pagination_index + 1,
                        }));
                      }}
                    >
                      <TextMaker
                        k="paginate_next"
                        args={{ next_page_size: next_page_size }}
                      />
                      <br />
                      <span className="aria-hidden">▼</span>
                    </ListGroupItem>
                  ),
                ];
              })
              .value()}
          </ListGroup>
        );
      }
    })();

    return (
      <div className="rbt" style={{ position: "relative" }}>
        <div className="search-bar">
          <div className="search-icon-container">
            <span aria-hidden="true">
              <img
                src={`${get_static_url("svg/search.svg")}`}
                style={{ width: "30px", height: "30px" }}
              />
            </span>
          </div>
          <input
            style={{ width: "100%" }}
            placeholder={placeholder}
            onChange={update_search_text}
            ref={this.typeaheadRef}
            onKeyDown={this.handleKeyDown}
            value={search_text}
          />
          {filter_content ? (
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={
                <Popover style={{ maxWidth: "100%" }} id="search-filter-button">
                  {filter_content}
                </Popover>
              }
            >
              <button
                className="btn btn-ib-primary"
                style={{
                  textAlign: "start",
                  whiteSpace: "nowrap",
                  paddingLeft: "0.5rem",
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
                    <IconFilter height="5px" width="5px" vertical_align="top" />
                  </div>
                </MediaQuery>
                <span>Filter</span>
              </button>
            </OverlayTrigger>
          ) : null}
        </div>
        {search_text.length >= minLength && menu}
      </div>
    );
  }
}

Typeahead.defaultProps = {
  pagination_size: 30,
  placeholder: text_maker("org_search"),
  minLength: 3,
  onNewQuery: _.noop,
};
