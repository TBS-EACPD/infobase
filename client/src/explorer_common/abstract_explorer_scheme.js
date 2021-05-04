import _ from "lodash";
import React from "react";
import { connect, Provider } from "react-redux";
import { createStore, combineReducers, applyMiddleware } from "redux";
import redux_promise_middleware from "redux-promise-middleware";
import { createSelector } from "reselect";

import { is_dev } from "src/core/injected_build_constants.ts";

import { cached_property, bound } from "src/general_utils.js";

import {
  filter_hierarchy,
  toggleExpandedFlat,
  ensureVisibility,
  sort_hierarchy,
} from "./hierarchy_tools.js";
import { substr_search_generator } from "./search_tools.js";

const initial_root_state = {
  query: "",
  loading: false,
  userExpanded: [],
  userCollapsed: [],
};

function ids_to_update(root, should_expand) {
  const get_ids_to_update = ({ isExpanded, id, children }) => [
    (should_expand && !isExpanded) || (!should_expand && isExpanded) ? id : [],
    _.map(children, get_ids_to_update),
  ];
  return _.flattenDeep(get_ids_to_update(root));
}

function root_reducer(state = initial_root_state, action) {
  const { type, payload } = action;

  switch (type) {
    case "toggle_node": {
      const { node } = payload;

      const shouldExpand = !node.isExpanded;
      const { id } = node;

      const { userExpanded: oldExpanded, userCollapsed: oldCollapsed } = state;

      if (_.includes(oldExpanded, id)) {
        return { ...state, userExpanded: _.without(oldExpanded, id) };
      } else if (_.includes(oldCollapsed, id)) {
        return { ...state, userCollapsed: _.without(oldCollapsed, id) };
      } else {
        if (shouldExpand) {
          return { ...state, userExpanded: oldExpanded.concat(id) };
        } else {
          return { ...state, userCollapsed: oldCollapsed.concat(id) };
        }
      }
    }

    case "clear_query": {
      return { ...state, loading: false, query: "" };
    }

    case "set_query": {
      const { query } = payload;
      return { ...state, query, loading: query.length > 3 };
    }

    case "enable_loading": {
      if (state.loading) {
        return state;
      } else {
        return { ...state, loading: true };
      }
    }

    case "clear_loading": {
      if (!state.loading) {
        return state;
      } else {
        return { ...state, loading: false };
      }
    }

    case "expand_all": {
      const { root } = payload;
      const { userExpanded: oldExpanded } = state;

      return {
        ...state,
        userExpanded: oldExpanded.concat(ids_to_update(root, true)),
        userCollapsed: [],
      };
    }

    case "collapse_all": {
      const { root } = payload;
      const { userCollapsed: oldCollapsed } = state;

      return {
        ...state,
        userExpanded: [],
        userCollapsed: oldCollapsed.concat(ids_to_update(root, false)),
      };
    }

    case "clear_expanded_collapsed": {
      return {
        ...state,
        userExpanded: [],
        userCollapsed: [],
      };
    }

    default: {
      return state;
    }
  }
}

const negative_search_relevance_func = ({ is_search_match }) =>
  is_search_match ? 0 : 1;

export class AbstractExplorerScheme {
  // attach the component here
  Component = undefined;

  constructor() {
    // this object is mostly stateless apart from holding on to selectors
    // but it holds on to the last state change's processed hierarchies to efficiently calculate the next state's resulting hierarchies
    this.oldState = null;
    this.oldFlatNodes = null;
    this.oldSortFunc = null;
  }

  // You'll probably want to override scheme reducer/initial_state.
  // But a simple explorer can just display a filterable hierarchy without any overriding
  get_scheme_reducer() {
    //shorthand for subclasses
    if (this.scheme_reducer) {
      return this.scheme_reducer;
    }
    return (state = {}, action) => state;
  }
  get_initial_scheme_state() {
    //shorthand for subclasses
    if (this.initial_scheme_state) {
      return this.initial_scheme_state;
    }
    return {};
  }

  @cached_property
  get_store() {
    return createStore(
      this.create_reducer(),
      this.get_initial_state(),
      applyMiddleware(redux_promise_middleware)
    );
  }

  @cached_property
  get_container_component() {
    const connecter = connect(
      this.map_state_to_props,
      this.map_dispatch_to_props
    );
    return connecter(this.Component);
  }

  to_react_element(props) {
    const ContainerComponent = this.get_container_component();
    const store = this.get_store();
    return (
      <Provider store={store}>
        <ContainerComponent {...props} />
      </Provider>
    );
  }

  should_regenerate_hierarchy(previous_state, current_state) {
    // usually, any update to the scheme involves re-generating the hierarchy. But some pieces of state shouldn't do this, such as sorting state or state that changes the appearance of nodes.
    // If your scheme has state like this, you should override this function
    return previous_state.scheme !== current_state.scheme;
  }

  get_initial_state() {
    return {
      root: initial_root_state,
      scheme: this.get_initial_scheme_state(),
    };
  }
  create_reducer() {
    return combineReducers({
      scheme: this.get_scheme_reducer(),
      root: root_reducer,
    });
  }

  @bound
  map_state_to_props(state) {
    return {
      ...state.root,
      is_filtering: this.get_is_filtering_selector()(state),
      flat_nodes: this._get_flat_nodes(state),
      base_hierarchy: this.get_base_hierarchy_selector()(state),
    };
  }

  @bound
  map_dispatch_to_props(dispatch) {
    const set_query = (query) => {
      //because it might take a while, even if synchronous, we dispatch this action separately
      dispatch({
        type: "set_query",
        payload: { query },
      });

      setTimeout(() => {
        dispatch({ type: "clear_loading" });
      }, 500);
    };

    const toggle_node = (node) =>
      dispatch({
        type: "toggle_node",
        payload: { node },
      });

    const clear_query = () => dispatch({ type: "clear_query" });

    const enable_loading = () => dispatch({ type: "enable_loading" });

    const expand_all = (root) =>
      dispatch({
        type: "expand_all",
        payload: { root },
      });

    const collapse_all = (root) =>
      dispatch({
        type: "collapse_all",
        payload: { root },
      });

    const clear_expanded_collapsed = () =>
      dispatch({
        type: "clear_expanded_collapsed",
      });

    return {
      set_query,
      toggle_node,
      clear_query,
      enable_loading,
      expand_all,
      collapse_all,
      clear_expanded_collapsed,
    };
  }

  get_base_hierarchy_selector() {
    throw new Error("NotImplemented");
  }

  @cached_property
  get_is_filtering_selector() {
    return (state) => state.root.query.length > 3;
  }

  @cached_property
  get_query_filter_func_selector() {
    // note that we create a new filter FUNCTION each time the base hierarchy changes
    // this filter function's closure keeps a processed version of the hierarchy
    // this keeps successive searches acrross different queries quick

    return createSelector([this.get_base_hierarchy_selector()], (base_h7y) =>
      substr_search_generator(base_h7y)
    );
  }

  @cached_property
  get_query_filtered_hierarchy_selector() {
    return createSelector(
      [
        this.get_base_hierarchy_selector(),
        this.get_query_filter_func_selector(),
        (state) => state.root.query,
      ],
      (base_h7y, query_filter_func, query) => {
        if (query.length < 4) {
          return base_h7y;
        } else {
          const filtered = filter_hierarchy(
            base_h7y,
            query_filter_func(query),
            { markSearchResults: true }
          );
          ensureVisibility(filtered, _.property("is_search_match"));
          return filtered;
        }
      }
    );
  }

  @cached_property
  get_filter_func_selector() {
    // override to filter based on scheme state
    return (_state) => {
      return (node) => node;
    };
  }

  @cached_property
  get_sort_func_selector() {
    // override to filter based on scheme state
    // unlike functions passed to _.sortBy, this function takes a list and must return a new sorted list
    return (state) => {
      return (nodes) => nodes;
    };
  }

  @cached_property
  get_fully_filtered_hierarchy_selector() {
    const get_query_filtered_hierarchy = this.get_query_filtered_hierarchy_selector();
    const get_filter_func = this.get_filter_func_selector();
    return createSelector(
      [get_query_filtered_hierarchy, get_filter_func],
      (query_filtered_hierarchy, filter_func) => {
        return filter_func(query_filtered_hierarchy);
      }
    );
  }

  @cached_property
  get_sorted_filtered_hierarchy_selector() {
    const get_fully_filtered_hierarchy = this.get_fully_filtered_hierarchy_selector();
    const get_sort_func = this.get_sort_func_selector();
    return createSelector(
      [get_fully_filtered_hierarchy, get_sort_func],
      (filtered_hierarchy, sort_func) => {
        return _.chain(filtered_hierarchy)
          .thru((h7y) => sort_hierarchy(h7y, sort_func))
          .sortBy(negative_search_relevance_func) //search results always take precedence
          .value();
      }
    );
  }

  _get_flat_nodes(state) {
    let flat_nodes;
    const get_sort_func = this.get_sort_func_selector();
    const sort_func = get_sort_func(state);

    if (this._should_completely_recompute_flat_nodes(state)) {
      const get_sorted_filtered_h7y = this.get_sorted_filtered_hierarchy_selector();
      flat_nodes = get_sorted_filtered_h7y(state);
    } else if (
      this.oldState.root.userCollapsed !== state.root.userCollapsed ||
      this.oldState.root.userExpanded !== state.root.userExpanded
    ) {
      //union the SYMMETRIC differences
      const potential_to_toggle = _.union(
        _.difference(
          this.oldState.root.userCollapsed,
          state.root.userCollapsed
        ),
        _.difference(
          state.root.userCollapsed,
          this.oldState.root.userCollapsed
        ),
        _.difference(this.oldState.root.userExpanded, state.root.userExpanded),
        _.difference(state.root.userExpanded, this.oldState.root.userExpanded)
      );

      // IMPORTANT: expanded/collapsed state is stored in state.root, largely managed by explorer_common code.
      // The actual set of nodes present in any explorer depends entirely on root.scheme state, which is
      // entirely managed, and almost entirely up to, each individual explorer implementation. There is nothing
      // in explorer_common to ensure that the ids in userCollapsed and userExpanded are in sync with the actual
      // list of current nodes (stored here in oldFlatNodes). To avoid errors, we have to filter out stale ids
      // from the root state before performing any action on them here; this avoids crashes but does NOT guarantee
      // correct behaviour. Each implementation of an explorer will need to be responsible for keeping things in sync
      // itself by dispatching clear_expanded_collapsed as needed...
      // This is just more book keeping and boilerplate for each explorer to juggle. Yet another pain point that won't
      // be addressed till it's all refactored

      const current_node_ids = _.map(this.oldFlatNodes, "id");

      const safe_to_toggle = _.intersection(
        potential_to_toggle,
        current_node_ids
      );

      if (!_.isEqual(potential_to_toggle, safe_to_toggle) && is_dev) {
        // eslint-disable-next-line no-console
        console.warn(
          `Some ids stored in this explorer implemntation's root.userCollapsed and root.userExpanded state do not
          exist in the current set of rendered nodes. Explorer implementations should dispatch clear_expanded_collapsed
          to keep things in sync when changes to their internal scheme sate result in a new set of nodes being displayed,
          otherwise there may be unexpected behaviour if ids are not unique across schemes.`
        );
      }

      flat_nodes = _.reduce(
        safe_to_toggle,
        (accumulator, node_id) =>
          toggleExpandedFlat(
            accumulator,
            _.find(accumulator, { id: node_id }),
            { toggleNode: true }
          ),
        this.oldFlatNodes
      );
    } else if (sort_func !== this.oldSortFunc) {
      flat_nodes = sort_hierarchy(this.oldFlatNodes, sort_func);
    } else {
      //nothing changes
      flat_nodes = this.oldFlatNodes;
    }

    this.oldState = state;
    this.oldFlatNodes = flat_nodes;
    this.oldSortFunc = sort_func;

    return flat_nodes;
  }

  _should_completely_recompute_flat_nodes(newState) {
    const is_non_initialized =
      !this.oldState || !this.oldFlatNodes || !this.oldSortFunc;

    if (is_non_initialized) {
      return true;
    }

    const has_query_changed = this.oldState.root.query !== newState.root.query;
    if (has_query_changed) {
      return has_query_changed;
    }

    return this.should_regenerate_hierarchy(this.oldState, newState);
  }
}
