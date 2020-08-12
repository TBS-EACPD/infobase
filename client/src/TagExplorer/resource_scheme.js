import { createSelector } from "reselect";

import {
  provide_sort_func_selector,
  get_resources_for_subject,
} from "../explorer_common/resource_explorer_common.js";
import {
  filter_hierarchy,
  convert_d3_hierarchy_to_explorer_hierarchy,
} from "../explorer_common/hierarchy_tools.js";

import { infograph_href_template } from "../link_utils.js";
import {
  shallowEqualObjectsOverKeys,
  sanitized_dangerous_inner_html,
} from "../general_utils.js";
import { year_templates } from "../models/years.js";
import { trivial_text_maker as text_maker } from "../models/text.js";

import { related_tags_row } from "./tag_hierarchy_utils.js";
import {
  hierarchy_scheme_configs,
  default_scheme_id,
} from "./hierarchy_scheme_configs.js";

const { planning_years } = year_templates;
const planning_year = _.head(planning_years);

function create_resource_hierarchy({ hierarchy_scheme, year }) {
  const hierarchy_scheme_config = hierarchy_scheme_configs[hierarchy_scheme];

  const get_resources = (subject) => get_resources_for_subject(subject, year);

  const root = {
    root: true,
    id: "root",
    data: {},
  };

  const d3_hierarchy = d3.hierarchy(root, (node) => {
    if (!_.isEmpty(node.children)) {
      return node.children; //shortcut: if children is already defined, use it.
    }

    if (node === root) {
      return hierarchy_scheme_config.get_depth_one_nodes(year);
    }

    const {
      id: parent_id,
      data: { subject },
    } = node;

    switch (subject.level) {
      case "tag": {
        if (subject.is_lowest_level_tag) {
          return _.map(subject.programs, (prog) => {
            return {
              id: `${parent_id}-${prog.guid}`,
              data: {
                name: `${prog.name} (${prog.dept.abbr || prog.dept.name})`,
                subject: prog,
                resources: get_resources(prog),
                defs: _.compact([
                  {
                    term: text_maker("org"),
                    def: (
                      <a href={infograph_href_template(prog.dept)}>
                        {prog.dept.name}
                      </a>
                    ),
                  },
                  {
                    term: text_maker("description"),
                    def: (
                      <div
                        dangerouslySetInnerHTML={sanitized_dangerous_inner_html(
                          prog.description
                        )}
                      />
                    ),
                  },
                  subject.is_m2m &&
                    !_.chain(prog.tags_by_scheme[subject.root.id])
                      .reject((tag) => tag.id === subject.id)
                      .isEmpty()
                      .value() &&
                    related_tags_row(
                      _.reject(
                        prog.tags_by_scheme[subject.root.id],
                        (tag) => tag.id === subject.id
                      ),
                      "program"
                    ),
                ]),
              },
            };
          });
        } else if (!_.isEmpty(subject.children_tags)) {
          return _.map(subject.children_tags, (tag) => ({
            id: tag.guid,
            data: {
              name: tag.name,
              subject: tag,
              resources: get_resources(tag),
              defs: tag.description && [
                {
                  term: text_maker("description"),
                  def: (
                    <div
                      dangerouslySetInnerHTML={sanitized_dangerous_inner_html(
                        tag.description
                      )}
                    />
                  ),
                },
              ],
            },
          }));
        }

        break;
      }

      case "dept": {
        return _.map(subject.crsos, (crso) => ({
          id: crso.guid,
          data: {
            subject: crso,
            name: crso.name,
            resources: get_resources(crso),
            defs: _.isEmpty(crso.description)
              ? null
              : [
                  {
                    term: text_maker("description"),
                    def: (
                      <div
                        dangerouslySetInnerHTML={sanitized_dangerous_inner_html(
                          crso.description
                        )}
                      />
                    ),
                  },
                ],
          },
        }));
      }

      case "crso": {
        return _.map(subject.programs, (prog) => ({
          id: `${parent_id}-${prog.guid}`, //due to m2m tagging, we need to include parent id here
          data: {
            resources: get_resources(prog),
            name: prog.name,
            subject: prog,
            defs: [
              {
                term: text_maker("description"),
                def: (
                  <div
                    dangerouslySetInnerHTML={sanitized_dangerous_inner_html(
                      prog.description
                    )}
                  />
                ),
              },
            ],
          },
        }));
      }

      default:
        return null;
    }
  });

  const unfiltered_flat_nodes = convert_d3_hierarchy_to_explorer_hierarchy(
    d3_hierarchy
  );

  //only allow nodes that are programs with planned spending data (and their descendants)
  const flat_nodes = filter_hierarchy(
    unfiltered_flat_nodes,
    (node) =>
      _.get(node, "data.subject.level") === "program" &&
      _.nonEmpty(_.get(node, "data.resources")),
    { markSearchResults: false, leaves_only: false }
  );

  return flat_nodes;
}

const get_initial_resource_state = ({ hierarchy_scheme, year }) => {
  const scheme_id = hierarchy_scheme || default_scheme_id;

  const can_roll_up = hierarchy_scheme_configs[scheme_id].can_roll_up;

  return {
    hierarchy_scheme: scheme_id,
    year: year || planning_year,
    sort_col: can_roll_up ? "spending" : "name",
    is_descending: can_roll_up,
  };
};

const resource_scheme = {
  key: "resources",
  get_sort_func_selector: () => provide_sort_func_selector("resources"),
  get_props_selector: () => {
    return (augmented_state) => augmented_state.resources;
  },
  dispatch_to_props: (dispatch) => ({
    col_click: (col_key) =>
      dispatch({ type: "column_header_click", payload: col_key }),
  }),
  //this helps the URL override store actions
  set_hierarchy_and_year(store, hierarchy_scheme, year) {
    store.dispatch({
      type: "set_hierarchy_and_year",
      payload: { hierarchy_scheme, year },
    });
  },
  reducer: (state = get_initial_resource_state({}), action) => {
    const { type, payload } = action;
    if (type === "set_hierarchy_and_year") {
      const { hierarchy_scheme, year } = payload;
      return { ...state, hierarchy_scheme, year };
    } else if (type === "set_hierarchy_scheme") {
      return { ...state, hierarchy_scheme: payload };
    } else if (type === "column_header_click") {
      const { is_descending, sort_col } = state;
      const clicked_col = payload;

      const mods =
        clicked_col === sort_col
          ? { is_descending: !is_descending }
          : { is_descending: true, sort_col: clicked_col };

      return { ...state, ...mods };
    } else if (type === "set_year") {
      return { ...state, year: payload };
    } else {
      return state;
    }
  },
  get_base_hierarchy_selector: () =>
    createSelector(
      (state) => state.resources.hierarchy_scheme,
      (state) => state.resources.year,
      (hierarchy_scheme, year) =>
        create_resource_hierarchy({
          hierarchy_scheme,
          year,
        })
    ),
  shouldUpdateFlatNodes(oldSchemeState, newSchemeState) {
    return !shallowEqualObjectsOverKeys(oldSchemeState, newSchemeState, [
      "hierarchy_scheme",
      "year",
    ]);
  },
};

export { resource_scheme, get_initial_resource_state };
