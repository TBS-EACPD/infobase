import { ListGroup, ListGroupItem } from "react-bootstrap";

import { TM } from "../../components/TextMaker.js";

import { create_text_maker } from "../../models/text.js";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);
const TextMaker = (props) => <TM tmf={text_maker} {...props} />;

export class TypeaheadMenu extends React.Component {
  handleWindowClick = (e) => {
    const { hide_menu } = this.props;
    if (!document.getElementsByClassName("rbt")[0].contains(e.target)) {
      hide_menu();
    }
  };

  render() {
    const {
      search_text,
      queried_results,
      config_groups,
      on_select_item,
      hide_menu,
    } = this.props;

    const total_matching_results = queried_results.length;

    let index_key_counter = 0;

    if (_.isEmpty(queried_results)) {
      return (
        <ListGroup className="rbt-menu dropdown-menu show">
          <ListGroupItem className="dropdown-header">
            {text_maker("no_matches_found")}
          </ListGroupItem>
        </ListGroup>
      );
    } else {
      return (
        <ListGroup className="rbt-menu dropdown-menu show">
          {_.chain(queried_results)
            .groupBy("config_group_index")
            .thru((grouped_results) => {
              return [
                <ListGroupItem
                  key={`header-pagination-info`}
                  className="dropdown-header"
                >
                  <TextMaker
                    k="paginate_status"
                    args={{
                      total_matching_results,
                    }}
                  />
                </ListGroupItem>,
                ..._.flatMap(grouped_results, (results, group_index) => [
                  <ListGroupItem
                    key={`header-${group_index}`}
                    className="dropdown-header"
                  >
                    {config_groups[group_index].group_header}
                  </ListGroupItem>,
                  <div
                    key={`group-${group_index}`}
                    role="group"
                    aria-label={config_groups[group_index].group_header}
                  >
                    {[
                      ..._.map(results, (result) => {
                        const index = index_key_counter++;
                        return (
                          <ListGroupItem
                            key={index}
                            id={`rbt-menu-item-${index}`}
                            aria-selected
                            className="dropdown-item"
                            onClick={() => on_select_item(result)}
                          >
                            {result.menu_content(search_text)}
                          </ListGroupItem>
                        );
                      }),
                    ]}
                  </div>,
                ]),
                <div>
                  <ListGroupItem
                    key={total_matching_results}
                    id={`rbt-menu-item-${total_matching_results}`}
                    className="rbt-menu-close-menu-button dropdown-item"
                    onClick={hide_menu}
                  >
                    Close menu
                  </ListGroupItem>
                </div>,
              ];
            })
            .value()}
        </ListGroup>
      );
    }
  }

  componentDidMount() {
    window.addEventListener("click", this.handleWindowClick);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.handleWindowClick);
  }
}
