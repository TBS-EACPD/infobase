import { createSelector } from "reselect";

import {
  get_resources_for_subject,
  provide_sort_func_selector,
} from "../../../../explorer_common/resource_explorer_common.js";
import {
  filter_hierarchy,
  convert_d3_hierarchy_to_explorer_hierarchy,
} from "../../../../explorer_common/hierarchy_tools.js";

import {
  shallowEqualObjectsOverKeys,
  sanitized_dangerous_inner_html,
} from "../../../../general_utils.js";

import { trivial_text_maker, year_templates } from "../../shared.js";

const { std_years, planning_years } = year_templates;

const actual_year = _.last(std_years);
const planning_year = _.head(planning_years);

function create_rooted_resource_hierarchy({ year, root_subject }) {
  const get_resources = (subject) => get_resources_for_subject(subject, year);

  const root = {
    root: true,
    id: "root",
    data: {
      subject: root_subject,
    },
  };

  const d3_hierarchy = d3.hierarchy(root, (node) => {
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
          .flatMap((progs, org_name) =>
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
          .value();
      }
      case "dept": {
        return _.map(subject.crsos, (crso) => ({
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
      _.nonEmpty(_.get(node, "data.resources")),
    { markSearchResults: false, leaves_only: false }
  );

  return flat_nodes;
}

const get_initial_resource_state = ({ subject, has_planning_data }) => ({
  sort_col: "spending",
  is_descending: true,
  year: has_planning_data ? planning_year : actual_year,
});

const partial_scheme = {
  key: "rooted_resources",
  get_sort_func_selector: () => provide_sort_func_selector("rooted_resources"),
  get_props_selector: () => {
    return (augmented_state) => _.clone(augmented_state.rooted_resources);
  },
  dispatch_to_props: (dispatch) => ({
    col_click: (col_key) =>
      dispatch({ type: "column_header_click", payload: col_key }),
    set_year: (year) => dispatch({ type: "set_year", payload: year }),
  }),
  reducer: (state = get_initial_resource_state({}), action) => {
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
  },
  shouldUpdateFlatNodes(oldSchemeState, newSchemeState) {
    return !shallowEqualObjectsOverKeys(oldSchemeState, newSchemeState, [
      "year",
    ]);
  },
};

//given a subject, created a rooted scheme using the above scheme. Hierarchy scheme should be evident from the level of the subject
function create_rooted_resource_scheme({ subject }) {
  return {
    ...partial_scheme,
    get_base_hierarchy_selector: () =>
      createSelector(
        (state) => state.rooted_resources.year,
        (year) =>
          create_rooted_resource_hierarchy({
            year,
            root_subject: subject,
          })
      ),
  };
}

export { create_rooted_resource_scheme, get_initial_resource_state };
