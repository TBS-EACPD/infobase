import { get_static_url } from "../request_utils.js";

import { breakpoints } from "../core/breakpoint_defs.js";

import { IconFilter } from "../icons/icons.js";

import "./Typeahead.scss";
import MediaQuery from "react-responsive";

export class Typeahead extends React.Component {
  state = {
    search_text: "",
  };

  constructor(props) {
    super(props);

    this.typeaheadRef = React.createRef();
  }

  update_search_text = (event) => {
    const { onInputChange } = this.props;
    onInputChange();
    this.setState({ search_text: event.target.value });
  };

  render() {
    const {
      placeholder,
      search_values,
      renderMenu,
      filterBy,
      minLength,
    } = this.props;

    const refresh_dropdown_menu = () => {
      this.forceUpdate();
    };

    const { search_text } = this.state;

    const filtered_results = _.filter(search_values, (res) => {
      return filterBy ? filterBy(res, { ...this.props, ...this.state }) : true;
    });

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
            value={this.state.search_text}
            onChange={this.update_search_text}
            ref={this.typeaheadRef}
          />
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
        </div>
        {search_text.length >= minLength &&
          renderMenu(filtered_results, {
            ...this.props,
            ...this.state,
            refresh_dropdown_menu,
          })}
      </div>
    );
  }
}
