import { hierarchy } from "d3-hierarchy";
import _ from "lodash";
import React from "react";
import { createSelector } from "reselect";

import { trivial_text_maker } from "src/models/text";

import { AbstractExplorerScheme } from "src/explorer_common/abstract_explorer_scheme";
import {
  filter_hierarchy,
  convert_d3_hierarchy_to_explorer_hierarchy,
} from "src/explorer_common/hierarchy_tools.js";
import {
  get_resources_for_subject,
  create_sort_func_selector,
} from "src/explorer_common/resource_explorer_common.js";
import {
  cached_property,
  bound,
  shallowEqualObjectsOverKeys,
  sanitized_dangerous_inner_html,
} from "src/general_utils";

import SingleTagResourceExplorerComponent from "./explorer_component.js";

import { planning_year, actual_year } from "./utils.js";

function create_rooted_resource_hierarchy({ year, root_subject }) {
  const get_resources = (subject) => get_resources_for_subject(subject, year);

  const root = {
    root: true,
    id: "root",
    data: {
      subject: root_subject,
    },
  };

  const d3_hierarchy = hierarchy(root, (node) => {
    const {
      id: parent_id,
      data: { subject },
    } = node;

    const description_term = trivial_text_maker("description");

    switch (subject.level) {
      case "tag": {
        if (!subject.is_lowest_level_tag) {
          throw "Only lowest_level_tag tags allowed here";
        }

        return _.chain(subject.programs)
          .groupBy((prog) => prog.dept.name)
          .map((progs, org_name) =>
            _.map(progs, (prog) => ({
              id: `${parent_id}-${prog.guid}`,
              data: {
                name: `${prog.name}`,
                subject: prog,
                resources: get_resources(prog),
                header: org_name,
                defs: [
                  {
                    term: description_term,
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
            }))
          )
          .flatten()
          .value();
      }
      case "dept": {
        return _.chain(subject.crsos)
          .map((crso) => ({
            id: crso.guid,
            data: {
              subject: crso,
              name: crso.name,
              resources: get_resources(crso),
              header: crso.plural,
              defs: _.isEmpty(crso.description)
                ? null
                : [
                    {
                      term: description_term,
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
                term: description_term,
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

export class SingleTagResourceExplorer extends AbstractExplorerScheme {
  Component = SingleTagResourceExplorerComponent;

  constructor(subject, has_planning_data, has_actual_data) {
    super();
    this.subject = subject;
    this.initial_scheme_state = {
      sort_col: "spending",
      is_descending: true,
      year: has_planning_data ? planning_year : actual_year,
    };
  }

  scheme_reducer = (state = {}, action) => {
    const { type, payload } = action;
    if (type === "column_header_click") {
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

  @bound
  map_dispatch_to_props(dispatch) {
    const col_click = (col_key) =>
      dispatch({ type: "column_header_click", payload: col_key });
    const set_year = (year) => dispatch({ type: "set_year", payload: year });

    return {
      ...super.map_dispatch_to_props(dispatch),
      col_click,
      set_year,
    };
  }

  @bound
  map_state_to_props(state) {
    return {
      ...super.map_state_to_props(state),
      ...state.scheme,
    };
  }

  @cached_property
  get_base_hierarchy_selector() {
    return createSelector(
      (state) => state.scheme.year,
      (year) =>
        create_rooted_resource_hierarchy({
          year,
          root_subject: this.subject,
        })
    );
  }

  @cached_property
  get_sort_func_selector() {
    return create_sort_func_selector("scheme");
  }
  should_regenerate_hierarchy(old_state, new_state) {
    return !shallowEqualObjectsOverKeys(old_state.scheme, new_state.scheme, [
      "year",
    ]);
  }
}
