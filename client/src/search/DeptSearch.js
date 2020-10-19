import React from "react";
import { withRouter } from "react-router";

import { make_orgs_search_config, all_dp_orgs } from "./search_configs.js";

import { Typeahead } from "./Typeahead/Typeahead.js";

class DeptSearchWithoutRouter extends React.Component {
  render() {
    const {
      include_orgs_without_data,
      only_include_dp,
      href_template,
      history,
      onNewQuery,
      placeholder,
    } = this.props;

    let { onSelect } = this.props;

    if (!onSelect && href_template && history) {
      onSelect = (item) => {
        history.push(href_template(item));
      };
    }

    const search_config = only_include_dp
      ? all_dp_orgs
      : make_orgs_search_config({
          orgs_to_include: !include_orgs_without_data ? "all" : "with_data",
        });

    return (
      <Typeahead
        onNewQuery={onNewQuery}
        placeholder={placeholder}
        search_configs={[search_config]}
        onSelect={onSelect}
      />
    );
  }
}

const DeptSearch = withRouter(DeptSearchWithoutRouter);

export { DeptSearch, DeptSearchWithoutRouter };
