import _ from "lodash";
import React from "react";

import { SpinnerWrapper } from "src/components/index.js";

import { ensure_loaded } from "src/core/ensure_loaded.js";
import { StandardRouteContainer } from "src/core/NavComponents.js";

import {
  hierarchy_scheme_configs,
  default_scheme_id,
} from "./hierarchy_scheme_configs.js";
import { ResourceScheme } from "./resource_scheme.js";

import {
  text_maker,
  TM,
  route_arg_to_year_map,
  planning_year,
} from "./utils.js";

import "src/explorer_common/explorer-styles.scss";

class ExplorerContainer extends React.Component {
  constructor(props) {
    super(props);
    const { hierarchy_scheme, year } = props;

    this.explorer_instance = new ResourceScheme(hierarchy_scheme, year);
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.hierarchy_scheme !== prevProps.hierarchy_scheme ||
      this.props.year !== prevProps.year
    ) {
      this.explorer_instance.set_hierarchy_and_year(
        this.props.hierarchy_scheme,
        this.props.year
      );
    }
  }
  render() {
    return this.explorer_instance.to_react_element();
  }
}

export default class TagExplorer extends React.Component {
  constructor() {
    super();
    this.state = { loading: true };
  }
  componentDidMount() {
    ensure_loaded({
      table_keys: ["programSpending", "programFtes"],
    }).then(() => {
      this.setState({ loading: false });
    });
  }
  render() {
    const { match } = this.props;
    const route_container_args = {
      title: text_maker("tag_nav"),
      breadcrumbs: [text_maker("tag_nav")],
      description: text_maker("tag_nav_intro_text"),
      route_key: "_resource-explorer",
    };
    const header = (
      <h1>
        <TM k="tag_nav" />
      </h1>
    );

    if (this.state.loading) {
      return (
        <StandardRouteContainer {...route_container_args}>
          {header}
          <SpinnerWrapper config_name={"route"} />
        </StandardRouteContainer>
      );
    }
    let {
      params: { hierarchy_scheme, period },
    } = match;

    hierarchy_scheme = _(hierarchy_scheme_configs)
      .map("id")
      .includes(hierarchy_scheme)
      ? hierarchy_scheme
      : default_scheme_id;

    const year = route_arg_to_year_map[period] || planning_year;

    return (
      <StandardRouteContainer {...route_container_args}>
        {header}
        <ExplorerContainer {...{ hierarchy_scheme, year }} />
      </StandardRouteContainer>
    );
  }
}
