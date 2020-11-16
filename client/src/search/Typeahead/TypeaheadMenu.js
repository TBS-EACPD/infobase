import { create_text_maker_component } from "../../components";

import text from "./Typeahead.yaml";

const { text_maker, TM } = create_text_maker_component(text);

class TypeaheadMenu_ extends React.Component {
  handleWindowClick = (e) => {
    const { hide_menu, rbtRef } = this.props;
    if (!rbtRef.current.contains(e.target)) {
      hide_menu();
    }
  };
  componentDidMount() {
    window.addEventListener("click", this.handleWindowClick);
  }

  render() {
    const {
      search_text,
      queried_results,
      config_groups,
      on_select_item,
      hide_menu,
      firstMenuItemRef,
      menuId,
    } = this.props;

    const total_matching_results = queried_results.length;

    let index_key_counter = 0;

    if (_.isEmpty(queried_results)) {
      return (
        <ul className="rbt-menu dropdown-menu show" id={menuId} role="listbox">
          <li className="dropdown-header">{text_maker("no_matches_found")}</li>
        </ul>
      );
    } else {
      return (
        <ul className="rbt-menu dropdown-menu show" id={menuId} role="listbox">
          {_.chain(queried_results)
            .groupBy("config_group_index")
            .thru((grouped_results) => {
              return [
                <li key={`header-pagination-info`} className="dropdown-header">
                  <TM
                    k="paginate_status"
                    args={{
                      total_matching_results,
                    }}
                  />
                </li>,
                ..._.flatMap(grouped_results, (results, group_index) => [
                  <li key={`header-${group_index}`} className="dropdown-header">
                    {config_groups[group_index].group_header}
                  </li>,
                  <div
                    key={`group-${group_index}`}
                    role="group"
                    aria-label={config_groups[group_index].group_header}
                  >
                    {[
                      ..._.map(results, (result) => {
                        const index = index_key_counter++;
                        return (
                          <button
                            key={index}
                            className="dropdown-item list-group-item"
                            onClick={() => on_select_item(result)}
                            ref={index == 0 && firstMenuItemRef}
                          >
                            {result.menu_content(search_text)}
                          </button>
                        );
                      }),
                    ]}
                  </div>,
                ]),
                <div key={`div_${total_matching_results + 1}`}>
                  <li
                    key={total_matching_results}
                    className="rbt-menu-close-menu-button dropdown-item"
                    onClick={hide_menu}
                  >
                    {text_maker("close_menu")}
                  </li>
                </div>,
              ];
            })
            .value()}
        </ul>
      );
    }
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.handleWindowClick);
  }
}

export const TypeaheadMenu = React.forwardRef((props, ref) => (
  <TypeaheadMenu_ firstMenuItemRef={ref} {...props} />
));
