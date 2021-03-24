import _ from "lodash";
import React from "react";
import { createSelector } from "reselect";

import { StandardRouteContainer } from "src/core/NavComponents.js";

import { AbstractExplorerScheme } from "src/explorer_common/abstract_explorer_scheme.js";

import { filter_hierarchy } from "src/explorer_common/hierarchy_tools.js";
import { cached_property, bound } from "src/general_utils.js";

//drilldown stuff

import { ExplorerForIgoc } from "./explorer_view.js";
import { create_igoc_hierarchy } from "./hierarchies.js";
import { igoc_tmf as text_maker, TM } from "./igoc_explorer_text.js";

import "./IgocExplorer.scss";

class IgocExplorerScheme extends AbstractExplorerScheme {
  Component = ExplorerForIgoc;
  constructor(grouping = "portfolio") {
    super();
    this.initial_scheme_state = {
      grouping,
      should_show_orgs_without_data: true,
    };
  }

  scheme_reducer = (
    state = { grouping: "portfolio", should_show_orgs_without_data: true },
    action
  ) => {
    const { type, payload } = action;
    switch (type) {
      case "toggle_orgs_without_data":
        return {
          ...state,
          should_show_orgs_without_data: !state.should_show_orgs_without_data,
        };
      case "set_grouping":
        return { ...state, grouping: payload };
      default:
        return state;
    }
  };

  @cached_property
  get_base_hierarchy_selector() {
    return createSelector(
      (state) => state.scheme.grouping,
      (grouping) => create_igoc_hierarchy(grouping)
    );
  }

  @cached_property
  get_filter_func_selector() {
    return createSelector(
      (state) => state.scheme.should_show_orgs_without_data,
      (should_show_orgs_without_data) => {
        if (should_show_orgs_without_data) {
          // no filtering at all
          return _.identity;
        }
        //a function like this can easily be split off from the class
        return (nodes) =>
          filter_hierarchy(
            nodes,
            (node) => (_.get(node, "data.subject.tables.length") || 0) > 1,
            { leaves_only: false, markSearchResults: false }
          );
      }
    );
  }

  @bound
  map_dispatch_to_props(dispatch) {
    const on_toggle_orgs_without_data = () =>
      dispatch({
        type: "toggle_orgs_without_data",
      });

    return {
      ...super.map_dispatch_to_props(dispatch),
      on_toggle_orgs_without_data,
    };
  }

  @bound
  map_state_to_props(state) {
    return {
      ...super.map_state_to_props(state),
      grouping: state.scheme.grouping,
      should_show_orgs_without_data: state.scheme.should_show_orgs_without_data,
    };
  }

  //This is a wrapper around dispatch to encapsulate the store
  update_grouping(grouping) {
    this.get_store().dispatch({
      type: "set_grouping",
      payload: grouping,
    });
  }
}

//This component serves as a way to keep an explorer accross route changes
class ExplorerContainer extends React.Component {
  constructor(props) {
    super();
    const { grouping } = props;

    this.explorer_scheme = new IgocExplorerScheme(grouping);
  }
  componentDidUpdate(prevProps) {
    if (this.props.grouping !== prevProps.grouping) {
      this.explorer_scheme.update_grouping(this.props.grouping);
    }
  }
  render() {
    return this.explorer_scheme.to_react_element();
  }
}

const IgocExplorer = ({ match }) => {
  let grouping = _.get(match, "params.grouping");
  if (_.isEmpty(grouping)) {
    grouping = "portfolio";
  }
  return (
    <StandardRouteContainer
      breadcrumbs={[text_maker("igoc")]}
      title={text_maker("igoc")}
      route_key="_igoc_explorer"
      description={text_maker("igoc_desc_meta_attr")}
    >
      <div>
        <h1>
          <TM k="igoc" />
        </h1>
      </div>
      <div className="medium-panel-text">
        <div style={{ marginBottom: "1.5em" }}>
          <TM k="about_inventory" />
        </div>
        <ExplorerContainer grouping={grouping} />
      </div>
    </StandardRouteContainer>
  );
};
export { IgocExplorer as default };
