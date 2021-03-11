import { hierarchy } from "d3-hierarchy";
import _ from "lodash";
import React from "react";
import { createSelector } from "reselect";

import { trivial_text_maker as text_maker } from "src/models/text.js";

import { AbstractExplorerScheme } from "src/explorer_common/abstract_explorer_scheme.js";
import {
  filter_hierarchy,
  convert_d3_hierarchy_to_explorer_hierarchy,
} from "src/explorer_common/hierarchy_tools.js";
import {
  create_sort_func_selector,
  get_resources_for_subject,
} from "src/explorer_common/resource_explorer_common.js";
import {
  cached_property,
  bound,
  shallowEqualObjectsExceptKeys,
  sanitized_dangerous_inner_html,
} from "src/general_utils.js";

import { infograph_href_template } from "src/link_utils.js";

import { hierarchy_scheme_configs } from "./hierarchy_scheme_configs.js";
import { related_tags_row } from "./tag_hierarchy_utils.js";
import TagExplorerComponent from "./TagExplorerComponent.js";

function create_resource_hierarchy({ hierarchy_scheme, year }) {
  const hierarchy_scheme_config = hierarchy_scheme_configs[hierarchy_scheme];

  const get_resources = (subject) => get_resources_for_subject(subject, year);

  const root = {
    root: true,
    id: "root",
    data: {},
  };

  const d3_hierarchy = hierarchy(root, (node) => {
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
          return _.chain(subject.programs)
            .map((prog) => ({
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
                    !_.isEmpty(
                      _.filter(
                        prog.tags_by_scheme[subject.root.id],
                        (tag) => tag.id !== subject.id
                      )
                    ) &&
                    related_tags_row(
                      _.filter(
                        prog.tags_by_scheme[subject.root.id],
                        (tag) => tag.id !== subject.id
                      ),
                      "program"
                    ),
                ]),
              },
            }))
            .value();
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
        return _.chain(subject.crsos)
          .map((crso) => ({
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
          }))
          .value();
      }

      case "crso": {
        return subject.programs.map((prog) => ({
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
      !_.isEmpty(_.get(node, "data.resources")),
    { markSearchResults: false, leaves_only: false }
  );

  return flat_nodes;
}

export class ResourceScheme extends AbstractExplorerScheme {
  Component = TagExplorerComponent;
  constructor(initial_hierarchy_key, initial_year) {
    super();

    const can_roll_up =
      hierarchy_scheme_configs[initial_hierarchy_key].can_roll_up;

    this.initial_scheme_state = {
      hierarchy_scheme: initial_hierarchy_key,
      year: initial_year,
      sort_col: can_roll_up ? "spending" : "name",
      is_descending: can_roll_up,
    };
  }

  @cached_property
  get_sort_func_selector() {
    return create_sort_func_selector("scheme");
  }

  @bound
  map_state_to_props(state) {
    return {
      ...super.map_state_to_props(state),
      ...state.scheme,
    };
  }

  @bound
  map_dispatch_to_props(dispatch) {
    const col_click = (col_key) =>
      dispatch({ type: "column_header_click", payload: col_key });

    return {
      ...super.map_dispatch_to_props(dispatch),
      col_click,
    };
  }

  @cached_property
  get_base_hierarchy_selector() {
    return createSelector(
      (state) => state.scheme.hierarchy_scheme,
      (state) => state.scheme.year,
      (hierarchy_scheme, year) =>
        create_resource_hierarchy({
          hierarchy_scheme,
          year,
        })
    );
  }

  should_regenerate_hierarchy(old_state, new_state) {
    return !shallowEqualObjectsExceptKeys(old_state.scheme, new_state.scheme, [
      "sort_col",
      "is_descending",
    ]);
  }

  set_hierarchy_and_year(hierarchy_scheme, year) {
    this.get_store().dispatch({
      type: "set_hierarchy_and_year",
      payload: { hierarchy_scheme, year },
    });
  }

  scheme_reducer = (state = {}, action) => {
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
  };
}
