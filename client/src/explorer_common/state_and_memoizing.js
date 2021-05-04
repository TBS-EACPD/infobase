import _ from "lodash";
import { createSelector } from "reselect";

import { is_dev } from "src/core/injected_build_constants.ts";

import {
  filter_hierarchy,
  toggleExpandedFlat,
  ensureVisibility,
  sort_hierarchy,
} from "./hierarchy_tools.js";
import { substr_search_generator } from "./search_tools.js";

const initial_root_state = {
  scheme_key: "results",
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

//receives the whole state, but only returns the 'root' slice
const map_state_to_root_props_from_memoized_funcs = ({
  is_filtering,
  get_flat_nodes,
  get_base_hierarchy,
}) => (entire_state) => ({
  ...entire_state.root,
  is_filtering: is_filtering(entire_state),
  flat_nodes: get_flat_nodes(entire_state),
  base_hierarchy: get_base_hierarchy(entire_state),
});

const map_dispatch_to_root_props = (dispatch) => {
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
};

//state derivations and implementation details
//wrapped in a function to allow for memoize caches to clear
//schemes must implement functions that return selectors for the following
//get_props_selectors
//get_filter_func_selector
//get_base_hierarchy_selector

const scheme_defaults = {
  get_filter_func_selector: () => _.constant(_.identity),
  get_sort_func_selector: () => _.constant(_.identity),
  get_props_selector: () => _.constant({}),
  shouldUpdateFlatNodes: (oldSchemeState, newSchemeState) =>
    oldSchemeState !== newSchemeState,
};

const negative_search_relevance_func = ({ is_search_match }) =>
  is_search_match ? 0 : 1;

function get_memoized_funcs(schemes) {
  schemes = _.mapValues(schemes, (scheme) =>
    _.defaults(_.clone(scheme), scheme_defaults)
  );

  const scheme_base_hierarchy_generators = _.chain(schemes)
    .map((scheme) => [scheme.key, scheme.get_base_hierarchy_selector()])
    .fromPairs()
    .value();

  const get_base_hierarchy = (state) =>
    scheme_base_hierarchy_generators[state.root.scheme_key](state);

  const scheme_props_generators = _.chain(schemes)
    .map((scheme) => [scheme.key, scheme.get_props_selector()])
    .fromPairs()
    .value();

  const scheme_filter_func_selectors = _.chain(schemes)
    .map((scheme) => [scheme.key, scheme.get_filter_func_selector()])
    .fromPairs()
    .value();

  //delegates to scheme specific
  const get_scheme_filter_func = (state) =>
    scheme_filter_func_selectors[state.root.scheme_key](state);

  const scheme_sort_func_selectors = _.chain(schemes)
    .map((scheme) => [scheme.key, scheme.get_sort_func_selector()])
    .fromPairs()
    .value();

  const get_scheme_sort_func = (state) =>
    scheme_sort_func_selectors[state.root.scheme_key](state);

  const is_filtering = (state) => state.root.query.length > 3;

  const get_query_filter_func = createSelector(
    [get_base_hierarchy],
    (base_hierarchy) => substr_search_generator(base_hierarchy)
  );

  const get_query_filtered_hierarchy = createSelector(
    [get_base_hierarchy, get_query_filter_func, (state) => state.root.query],
    (base_hierarchy, query_filter_func, query) => {
      if (query.length < 4) {
        return base_hierarchy;
      } else {
        const filtered = filter_hierarchy(
          base_hierarchy,
          query_filter_func(query),
          { markSearchResults: true }
        );
        ensureVisibility(filtered, _.property("is_search_match"));
        return filtered;
      }
    }
  );

  const get_scheme_props = (state) => {
    const query_filtered_hierarchy = get_query_filtered_hierarchy(state);
    const base_hierarchy = get_base_hierarchy(state);

    return scheme_props_generators[state.root.scheme_key]({
      ...state,
      query_filtered_hierarchy,
      base_hierarchy,
    });
  };

  const get_fully_filtered_hierarchy = createSelector(
    [get_query_filtered_hierarchy, get_scheme_filter_func],
    (query_filtered_hierarchy, scheme_filter_func) => {
      return scheme_filter_func(query_filtered_hierarchy);
    }
  );

  const get_sorted_filtered_hierarchy = createSelector(
    [get_fully_filtered_hierarchy, get_scheme_sort_func],
    (filtered_hierarchy, sort_func) => {
      return _.chain(filtered_hierarchy)
        .thru((h7y) => sort_hierarchy(h7y, sort_func))
        .sortBy(negative_search_relevance_func) //search results always take precedence
        .value();
    }
  );

  //hacky function that saves expensive hierarchy computations and toggling
  let oldState, oldFlatNodes, oldSortFunc;
  function shouldCompletelyRecomputeFlatNodes(oldState, newState) {
    //every scheme can update its own state,
    //unless it exposes a shouldUpdateFlatNodes(oldSchemeState, newSchemeState), any scheme-state change will trigger flat nodes to be recomputed.
    //recall that recomputing hierarchy will involve resetting userExpands/Collapses (this is the main reason for a scheme to implement shouldUpdateFlatNodes )

    const scheme_should_compute_func =
      _.find(schemes, { key: newState.root.scheme_key })
        .shouldUpdateFlatNodes ||
      ((oldSchemeState, newSchemeState) => oldSchemeState !== newSchemeState);

    const { scheme_key } = newState.root;

    return (
      !oldState || //if oldState isn't defined yet, we of course have to recompute
      !oldFlatNodes || //ditto for oldFlatNodes
      !oldSortFunc ||
      oldState.root.query !== newState.root.query ||
      oldState.root.scheme_key !== newState.root.scheme_key ||
      scheme_should_compute_func(oldState[scheme_key], newState[scheme_key])
    );
  }

  function get_flat_nodes(state) {
    let flat_nodes;
    const sort_func = get_scheme_sort_func(state);

    if (shouldCompletelyRecomputeFlatNodes(oldState, state)) {
      flat_nodes = get_sorted_filtered_hierarchy(state);
    } else if (
      oldState.root.userCollapsed !== state.root.userCollapsed ||
      oldState.root.userExpanded !== state.root.userExpanded
    ) {
      //union the SYMMETRIC differences
      const potential_to_toggle = _.union(
        _.difference(oldState.root.userCollapsed, state.root.userCollapsed),
        _.difference(state.root.userCollapsed, oldState.root.userCollapsed),
        _.difference(oldState.root.userExpanded, state.root.userExpanded),
        _.difference(state.root.userExpanded, oldState.root.userExpanded)
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

      const current_node_ids = _.map(oldFlatNodes, "id");

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
        oldFlatNodes
      );
    } else if (sort_func !== oldSortFunc) {
      flat_nodes = sort_hierarchy(oldFlatNodes, sort_func);
    } else {
      //nothing changes
      flat_nodes = oldFlatNodes;
    }

    oldState = state;
    oldFlatNodes = flat_nodes;
    oldSortFunc = sort_func;

    return flat_nodes;
  }

  return {
    is_filtering,
    get_query_filtered_hierarchy,
    get_base_hierarchy,
    get_flat_nodes,
    get_scheme_props,
  };
}

export {
  initial_root_state,
  root_reducer,
  map_dispatch_to_root_props,
  map_state_to_root_props_from_memoized_funcs,
  get_memoized_funcs,
};
