import "./IgocExplorer.scss";
import { StandardRouteContainer } from "../core/NavComponents.js";
import { createSelector } from "reselect";

//drilldown stuff
import { create_igoc_hierarchy } from "./hierarchies.js";
import { ExplorerForIgoc } from "./explorer_view.js";
import { filter_hierarchy } from "../explorer_common/hierarchy_tools.js";
import { igoc_tmf as text_maker, TM } from "./igoc_explorer_text.js";
import { map_state_to_root_props_from_memoized_funcs } from "../explorer_common/state_and_memoizing";
import { ExplorerContainer } from "../explorer_common/explorer_components";

const map_state_to_props_from_memoized_funcs = (memoized_funcs) => {
  const { get_scheme_props } = memoized_funcs;
  const mapRootStateToRootProps = map_state_to_root_props_from_memoized_funcs(
    memoized_funcs
  );

  return (state) => ({
    ...mapRootStateToRootProps(state),
    ...get_scheme_props(state),
  });
};

const scheme = {
  key: "igoc",

  get_props_selector: () =>
    createSelector(
      _.property("igoc.grouping"),
      _.property("igoc.should_show_orgs_without_data"),
      (grouping, should_show_orgs_without_data) => ({
        sort_func: _.identity,
        grouping,
        should_show_orgs_without_data,
      })
    ),

  dispatch_to_props: (dispatch) => ({
    on_toggle_orgs_without_data: () =>
      dispatch({ type: "toggle_orgs_without_data" }),
  }),

  reducer: (
    state = {
      grouping: "portfolio",
      should_show_orgs_without_data: true,
    },
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
  },

  get_base_hierarchy_selector: () =>
    createSelector(_.property("igoc.grouping"), (grouping) =>
      create_igoc_hierarchy(grouping)
    ),

  get_filter_func_selector: () =>
    createSelector(
      _.property("igoc.should_show_orgs_without_data"),
      (should_show_orgs_without_data) =>
        should_show_orgs_without_data
          ? _.identity
          : (nodes) =>
              filter_hierarchy(
                nodes,
                (node) => (_.get(node, "data.subject.tables.length") || 0) > 1,
                { leaves_only: false, markSearchResults: false }
              )
    ),
};

const IgocExplorer = ({ match }) => {
  let grouping = _.get(match, "params.grouping");
  if (_.isEmpty(grouping)) {
    grouping = "portfolio";
  }

  const get_initial_state = ({ grouping }) => ({
    grouping,
    should_show_orgs_without_data: true,
  });

  const update_explorer = ({ data, store }) => {
    const { grouping } = data;
    console.log("Hi");
    store.dispatch({
      type: "set_grouping",
      payload: grouping,
    });
  };

  const explorer_config = {
    scheme,
    explorer: ExplorerForIgoc,
    get_initial_state,
    map_state_to_props_from_memoized_funcs,
    data: { grouping },
    update_explorer,
  };

  //sanitize grouping param
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
      <div className="medium_panel_text">
        <div style={{ marginBottom: "1.5em" }}>
          <TM k="about_inventory" />
        </div>
        <ExplorerContainer {...explorer_config} />
      </div>
    </StandardRouteContainer>
  );
};

export { IgocExplorer as default };
