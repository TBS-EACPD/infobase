/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";
import React from "react";

import "./GlossarySidebar.scss";

import { get_glossary_items_by_letter } from "src/glossary/glossary_utils";

import { glossary_lite as glossary_search_config } from "src/search/search_configs";

import {
  SearchHighlighter,
  get_simplified_search_phrase,
} from "src/search/search_utils";

export class GlossaryList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scrollEl: "",
      search_phrase: "",
    };

    this.is_unmounting = false;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    console.log("maybe");
    const { search_phrase: next_phrase } = nextProps;
    const { search_phrase: prev_phrase } = prevState;

    if (next_phrase !== prev_phrase) {
      return {
        search_phrase: next_phrase,
      };
    } else {
      return null;
    }
  }

  componentWillUnmount() {
    this.is_unmounting = true;
  }

  componentDidUpdate() {
    const search_configs = [glossary_search_config];
    const { search_phrase } = this.state;

    if (search_phrase !== "") {
      _.each(search_configs, (search_config) => {
        const { config_name, query } = search_config;
        const is_not_loading_or_loaded = _.isUndefined(
          this.get_query_result_state(config_name, search_phrase)
        );

        if (is_not_loading_or_loaded) {
          this.set_query_result_state(
            config_name,
            search_phrase,
            "loading",
            () =>
              query(search_phrase).then(
                (matches) =>
                  !this.is_unmounting &&
                  this.set_query_result_state(
                    config_name,
                    search_phrase,
                    this.results_from_matches(
                      matches,
                      search_phrase,
                      search_config
                    )
                  )
              )
          );
        }
      });
    }

    /*
    if (this.state.scrollEl) {
      const el = document.getElementById(this.state.scrollEl);
      const scrollDiv = document.getElementById("gloss-sidebar");

      if (el && scrollDiv) {
        scrollDiv.scrollTop = el.offsetTop;
        el.focus();
      }
    }
    */
  }
  results_from_matches = (matches) =>
    _.map(matches, (match) => ({
      get_compiled_definition: match.get_compiled_definition,
      id: match.id,
      title: match.title,
    }));

  get_query_result_state_key = (config_name, search_phrase) =>
    `${config_name}__${get_simplified_search_phrase(search_phrase)}`;
  get_query_result_state = (config_name, search_phrase) =>
    this.state[this.get_query_result_state_key(config_name, search_phrase)];
  set_query_result_state = (
    config_name,
    search_phrase,
    state,
    callback = _.noop
  ) =>
    this.setState(
      {
        [this.get_query_result_state_key(config_name, search_phrase)]: state,
      },
      callback
    );

  openDefinition(item) {
    /*
    this.setState({
      scrollEl: item.title.replace(/\s+/g, ""),
    });
    */
    this.props.open_definition(item.id);
  }

  handleKeyPress(e, item) {
    if (e.key === "Enter" && item) {
      this.openDefinition(item);
    }
  }

  render() {
    const { search_configs } = this.props;
    const { search_phrase } = this.state;

    const maybe_results = _.flatMap(search_configs, ({ config_name }) =>
      this.get_query_result_state(config_name, search_phrase)
    );

    const still_loading_results = _.some(
      maybe_results,
      (result) => _.isUndefined(result) || result === "loading"
    );

    const results = !still_loading_results ? maybe_results : [];

    const items_by_letter = get_glossary_items_by_letter(results);

    return (
      <div>
        {_.map(items_by_letter, ({ letter, items }) => (
          <div key={letter}>
            <span className="glossary-sb__letter" key={letter}>
              {letter}
            </span>
            <hr />
            {_.map(items, (item, ix) => (
              <div key={ix} className="glossary-sb__title">
                <span
                  role="button"
                  //id={item.title.replace(/\s+/g, "")}
                  onClick={() => this.openDefinition(item)}
                  onKeyDown={(e) => this.handleKeyPress(e, item)}
                  tabIndex={0}
                >
                  {search_phrase ? (
                    <SearchHighlighter
                      search={search_phrase}
                      content={item.title}
                    />
                  ) : (
                    item.title
                  )}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
