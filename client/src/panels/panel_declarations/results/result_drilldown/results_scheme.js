import _ from "lodash";
import { createSelector } from "reselect";

import { Indicator } from "src/models/results";

import { Subject } from "src/models/subject";

import { ensure_loaded } from "src/core/lazy_loader.js";

import { AbstractExplorerScheme } from "src/explorer_common/abstract_explorer_scheme";
import { filter_hierarchy } from "src/explorer_common/hierarchy_tools.js";

import { toggle_list, cached_property, bound } from "src/general_utils.js";

import ResultsExplorerDisplay from "./result_drilldown_display";
import { create_full_results_hierarchy } from "./result_hierarchies.js";

export default class ResultsExplorer extends AbstractExplorerScheme {
  Component = ResultsExplorerDisplay;
  scheme_reducer = (state = {}, action) => {
    const { type, payload } = action;

    switch (type) {
      case "set_doc_PENDING":
        return {
          ...state,
          data_loading: true,
        };
      case "set_doc_FULFILLED":
        return {
          ...state,
          data_loading: false,
          doc: payload,
          status_key_whitelist: [], //reset filtering when doc changes
        };
      case "set_doc_REJECTED":
        throw `Ensure loaded for ${state.doc} results failed!`;
      case "status_click":
        return {
          ...state,
          status_key_whitelist: toggle_list(
            state.status_key_whitelist,
            payload
          ),
        };
      case "clear_status_filter":
        return {
          ...state,
          status_key_whitelist: [],
        };
      default:
        return state;
    }
  };

  constructor(subject_guid, doc) {
    super();
    this.initial_scheme_state = {
      data_loading: false,
      doc,
      status_key_whitelist: [],
      subject_guid: subject_guid,
    };
  }

  @cached_property
  get_base_hierarchy_selector() {
    return createSelector(
      [(state) => state.scheme.doc, (state) => state.scheme.subject_guid],
      (doc, subject_guid) =>
        create_full_results_hierarchy({
          subject_guid,
          doc,
          allow_no_result_branches: false,
        })
    );
  }

  @cached_property
  get_sort_func_selector() {
    const sort_func = (list) => _.sortBy(list, "data.name");
    return (_state) => sort_func;
  }

  @cached_property
  get_filter_func_selector() {
    return createSelector(
      (state) => state.scheme.status_key_whitelist,
      (status_key_whitelist) => {
        if (_.isEmpty(status_key_whitelist)) {
          return _.identity;
        }
        return (nodes) =>
          filter_hierarchy(
            nodes,
            (node) =>
              _.includes(
                status_key_whitelist,
                _.get(node, "data.indicator.status_key")
              ),
            { leaves_only: false, markSearchResults: false }
          );
      }
    );
  }

  @cached_property
  get_subject_selector() {
    return createSelector(
      (state) => state.scheme.subject_guid,
      (guid) => Subject.get_by_guid(guid)
    );
  }

  @cached_property
  get_icon_counts_selector() {
    return createSelector(
      (state) => state.scheme.data_loading,
      this.get_subject_selector(),
      (state) => state.scheme.doc,
      (is_loading, subject, doc) => {
        if (is_loading) {
          return false;
        }
        return _.chain(Indicator.get_flat_indicators(subject))
          .filter({ doc: doc })
          .groupBy("status_key")
          .mapValues((group, status_key) => group.length)
          .value();
      }
    );
  }

  @bound
  map_state_to_props(state) {
    const scheme_state = state.scheme;
    const { status_key_whitelist, mode, data_loading, doc } = scheme_state;

    const get_subject = this.get_subject_selector();
    const get_icon_counts = this.get_icon_counts_selector();

    return {
      ...super.map_state_to_props(state),
      data_loading,
      mode,
      doc,
      status_key_whitelist,
      subject: get_subject(state),
      icon_counts: get_icon_counts(state),
      is_status_filter_enabled: !_.isEmpty(status_key_whitelist),
    };
  }

  @bound
  map_dispatch_to_props(dispatch) {
    const set_doc = (doc, subject) =>
      dispatch({
        type: "set_doc",
        payload: ensure_loaded({
          subject: subject,
          results: true,
          result_docs: [doc],
        }).then(() => doc),
      });
    const toggle_status_status_key = (key) =>
      dispatch({ type: "status_click", payload: key });
    const clear_status_filter = () => dispatch({ type: "clear_status_filter" });

    return {
      ...super.map_dispatch_to_props(dispatch),
      set_doc,
      toggle_status_status_key,
      clear_status_filter,
    };
  }
}
