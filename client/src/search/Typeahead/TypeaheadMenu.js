import { ListGroup, ListGroupItem } from "react-bootstrap";

import { TM } from "../../components/TextMaker.js";

import { create_text_maker } from "../../models/text.js";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);
const TextMaker = (props) => <TM tmf={text_maker} {...props} />;

export class TypeaheadMenu extends React.Component {
  state = {
    pagination_index: 0,
  };

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
      on_select_item,
    } = this.props;

    const menu_item_selected = (selected) => {
      on_select_item(selected);
      this.setState({ pagination_index: 0 });
    };

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
                        onClick={() => menu_item_selected(result)}
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
  }
}
