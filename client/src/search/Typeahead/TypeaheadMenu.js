import { ListGroup, ListGroupItem } from "react-bootstrap";

import { TM } from "../../components/TextMaker.js";

import { create_text_maker } from "../../models/text.js";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);
const TextMaker = (props) => <TM tmf={text_maker} {...props} />;

export class TypeaheadMenu extends React.Component {
  render() {
    const {
      search_text,
      queried_results,
      config_groups,
      on_select_item,
      hide_menu,
    } = this.props;

    const menu_item_selected = (selected) => {
      on_select_item(selected);
    };

    const total_matching_results = queried_results.length;

    if (_.isEmpty(queried_results)) {
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
          {_.chain(queried_results)
            .groupBy("config_group_index")
            .thru((grouped_results) => {
              let index_key_counter = 0;
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
                  ..._.map(results, (result) => {
                    const index = index_key_counter++;
                    return (
                      <ListGroupItem
                        key={index}
                        id={`rbt-menu-item-${index}`}
                        aria-selected
                        className="dropdown-item"
                        onClick={() => menu_item_selected(result)}
                      >
                        {result.menu_content(search_text)}
                      </ListGroupItem>
                    );
                  }),
                ]),
                <ListGroupItem
                  key={total_matching_results + 1}
                  id={`rbt-menu-item-${total_matching_results + 1}`}
                  className="rbt-menu-pagination-option rbt-menu-pagination-option--next dropdown-item"
                  onClick={hide_menu}
                >
                  Close menu
                </ListGroupItem>,
              ];
            })
            .value()}
        </ListGroup>
      );
    }
  }
}
