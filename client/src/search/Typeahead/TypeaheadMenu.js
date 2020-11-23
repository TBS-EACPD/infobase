import { Fragment } from "react";

import { Status } from "./Status.js";

import { create_text_maker_component } from "../../components";

import text from "./Typeahead.yaml";

const { text_maker, TM } = create_text_maker_component(text);

class TypeaheadMenu_ extends React.Component {
  state = {
    pagination_index: 0,
  };

  handle_menu_select = (selected) => {
    const { on_select_item } = this.props;
    on_select_item(selected);
    this.setState({ pagination_index: 0 });
  };

  handleWindowClick = (e) => {
    const { hide_menu, rbtRef } = this.props;
    if (!rbtRef.current.contains(e.target)) {
      hide_menu();
    }
  };
  componentDidMount() {
    document.body.addEventListener("click", this.handleWindowClick);
  }

  componentDidUpdate(prev_props) {
    if (prev_props.search_text !== this.props.search_text) {
      this.setState({ pagination_index: 0 });
    }
  }

  render() {
    const { pagination_index } = this.state;
    const {
      search_text,
      pagination_size,
      queried_results,
      config_groups,
      hide_menu,
      firstMenuItemRef,
      menuId,
      show_menu,
      min_length,
    } = this.props;

    const paginate_results = (option, index) => {
      const page_start = pagination_size * pagination_index;
      const page_end = page_start + pagination_size;
      const is_on_displayed_page = !(index < page_start || index >= page_end);

      return is_on_displayed_page;
    };

    const paginated_results = _.filter(
      queried_results,
      (queried_result, index) => paginate_results(queried_result, index)
    );

    const page_range_start = pagination_index * pagination_size + 1;
    const page_range_end = page_range_start + paginated_results.length - 1;

    const total_matching_results = queried_results.length;

    const remaining_results =
      total_matching_results - (pagination_index + 1) * pagination_size;
    const next_page_size =
      remaining_results < pagination_size ? remaining_results : pagination_size;

    const status_props = {
      min_length,
      total_matching_results,
      page_range_start,
      page_range_end,
      query_length: search_text.length,
    };

    return (
      <Fragment>
        <Status {...status_props} />
        {show_menu &&
          (() => {
            if (_.isEmpty(paginated_results)) {
              return (
                <ul
                  className="rbt-menu dropdown-menu show"
                  id={menuId}
                  role="listbox"
                >
                  <li className="dropdown-header">
                    {text_maker("no_matches_found")}
                  </li>
                </ul>
              );
            } else {
              return (
                <ul
                  className="rbt-menu dropdown-menu show"
                  id={menuId}
                  role="listbox"
                >
                  {_.chain(paginated_results)
                    .groupBy("config_group_index")
                    .thru((grouped_results) => {
                      const needs_pagination_up_control = pagination_index > 0;
                      const needs_pagination_down_control =
                        page_range_end < total_matching_results;

                      const pagination_down_item_index = needs_pagination_up_control
                        ? paginated_results.length + 1
                        : paginated_results.length;

                      let index_key_counter = needs_pagination_up_control
                        ? 1
                        : 0;
                      return (
                        <Fragment>
                          <li
                            key={`header-pagination-info`}
                            className="dropdown-header"
                          >
                            <TM
                              k="paginate_status"
                              args={{
                                page_range_start,
                                page_range_end,
                                total_matching_results,
                              }}
                            />
                          </li>
                          {needs_pagination_up_control && (
                            <div>
                              <a
                                key="rbt-menu-item-0"
                                id="rbt-menu-item-0"
                                className="rbt-menu-pagination-option dropdown-item list-group-item"
                                onClick={(e) => {
                                  this.setState((prev_state) => ({
                                    pagination_index:
                                      prev_state.pagination_index - 1,
                                  }));
                                }}
                              >
                                <span className="aria-hidden">▲</span>
                                <br />
                                <TM
                                  k="paginate_previous"
                                  args={{ page_size: pagination_size }}
                                />
                              </a>
                            </div>
                          )}

                          {_.flatMap(
                            grouped_results,
                            (results, group_index) => (
                              <div key={`header-${group_index}`}>
                                <li className="dropdown-header">
                                  {config_groups[group_index].group_header}
                                </li>
                                {_.map(results, (result) => {
                                  const index = index_key_counter++;
                                  return (
                                    <a
                                      key={`rbt-menu-item-${index}`}
                                      id={`rbt-menu-item-${index}`}
                                      className="dropdown-item list-group-item"
                                      onClick={() =>
                                        this.handle_menu_select(result)
                                      }
                                      ref={index == 0 && firstMenuItemRef}
                                    >
                                      {result.menu_content(search_text)}
                                    </a>
                                  );
                                })}
                              </div>
                            )
                          )}
                          {needs_pagination_down_control && (
                            <div>
                              <a
                                key={`rbt-menu-item-${pagination_down_item_index}`}
                                id={`rbt-menu-item-${pagination_down_item_index}`}
                                className="rbt-menu-pagination-option dropdown-item list-group-item"
                                onClick={(e) => {
                                  this.setState((prev_state) => ({
                                    pagination_index:
                                      prev_state.pagination_index + 1,
                                  }));
                                }}
                              >
                                <TM
                                  k="paginate_next"
                                  args={{ next_page_size: next_page_size }}
                                />
                                <br />
                                <span className="aria-hidden">▼</span>
                              </a>
                            </div>
                          )}
                          <div>
                            <a
                              key={`rbt-menu-item-${
                                pagination_down_item_index + 1
                              }`}
                              id={`rbt-menu-item-${
                                pagination_down_item_index + 1
                              }`}
                              className="rbt-menu-close-menu-button dropdown-item list-group-item"
                              onClick={hide_menu}
                            >
                              {text_maker("close_menu")}
                            </a>
                          </div>
                        </Fragment>
                      );
                    })
                    .value()}
                </ul>
              );
            }
          })()}
      </Fragment>
    );
  }

  componentWillUnmount() {
    document.body.removeEventListener("click", this.handleWindowClick);
  }
}

export const TypeaheadMenu = React.forwardRef((props, ref) => (
  <TypeaheadMenu_ firstMenuItemRef={ref} {...props} />
));
