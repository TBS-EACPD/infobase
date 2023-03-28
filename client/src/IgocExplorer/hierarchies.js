import { hierarchy } from "d3-hierarchy";
import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { Dept } from "src/models/subjects";

import { convert_d3_hierarchy_to_explorer_hierarchy } from "src/explorer_common/hierarchy_tools";

import { igoc_tmf as text_maker } from "./igoc_explorer_text";

const { population_groups } = businessConstants;

const org_to_node = (subject, parent_id = "a") => ({
  id: `${parent_id}-${subject.id}`,
  data: {
    type: "org",
    name: subject.name,
    subject,
  },
});

const parent_inst_form_sort_order = [
  "min_dept_p",
  "dept_corp_p",
  "dept_agency_p",
  "spec_op_agency_p",
  "parl_ent_p",
  "crown_corp_p",
  "other_p",
  "corp_int",
];

const pop_group_node = ({ pop_group_key, children, is_expanded }) => ({
  id: pop_group_key,
  data: {
    name: population_groups[pop_group_key].text,
  },
  children,
  is_expanded,
});

const grouping_options = {
  portfolio: {
    option_name: text_maker("by_ministry"),
    get_nodes: () =>
      _.chain(Dept.store.get_all())
        .groupBy(
          (org) => _.get(org, "ministry.name") || text_maker("undef_ministry")
        )
        .map((orgs, min_name) => ({
          id: min_name,
          data: {
            type: "ministry",
            name: min_name,
          },
          children: _.chain(orgs)
            .reject("is_dead")
            .map((org) => org_to_node(org, min_name))
            .sortBy("data.name")
            .value(),
        }))
        .sortBy("data.name")
        .sortBy((node) => node.data.name === text_maker("undef_ministry"))
        .value(),
  },
  inst_form: {
    option_name: text_maker("by_inst_form"),
    get_nodes: () =>
      _.chain(Dept.store.get_all())
        .reject("is_dead")
        .groupBy("inst_form.parent_id")
        .map((orgs, parent_form_id) => ({
          id: parent_form_id,
          data: {
            name: Dept.instFormStore.lookup(parent_form_id).name,
            type: "inst_form",
          },
          children: _.chain(orgs)
            .groupBy("inst_form_id")
            .map((orgs, type_id) => ({
              id: type_id,
              data: {
                type: "inst_form",
                name: Dept.instFormStore.lookup(type_id).name,
              },
              children: _.chain(orgs)
                .map((org) => org_to_node(org, type_id))
                .sortBy("data.name")
                .value(),
            }))
            .value(),
        }))
        .forEach((parent_form_node) => {
          if (parent_form_node.children.length === 1) {
            //if an inst form grouping just contains a single inst form, 'skip' the level
            const { children } = parent_form_node.children[0];
            parent_form_node.children = children;
          } else {
            parent_form_node.is_expanded = true;
          }
        })
        .sortBy((parent_form_node) =>
          _.indexOf(parent_inst_form_sort_order, parent_form_node.id)
        )
        .value(),
  },
  historical: {
    option_name: text_maker("by_historical"),
    get_nodes: () =>
      _.chain(Dept.store.get_all())
        .filter("is_dead")
        .map((org) => org_to_node(org, "root"))
        .sortBy((node) => +node.data.subject.end_yr)
        .reverse()
        .value(),
  },
  pop_group: {
    option_name: text_maker("by_pop_group"),
    get_nodes: () => {
      /*
        fps
          cpa
            min_depts
            cpa_other_portion
          separate_agencies
        na
      */
      const orgs = _.chain(Dept.store.get_all())
        .reject("is_dead")
        .filter("pop_group_gp_key")
        .value();

      const cpa_min_dept_node = pop_group_node({
        pop_group_key: "cpa_min_depts",
        children: _.chain(orgs)
          .filter({ granular_pop_group_key: "cpa_min_depts" })
          .map(org_to_node)
          .value(),
      });

      const cpa_other_portion_node = pop_group_node({
        pop_group_key: "cpa_other_portion",
        children: _.chain(orgs)
          .filter({ granular_pop_group_key: "cpa_other_portion" })
          .map(org_to_node)
          .value(),
      });

      const cpa_node = pop_group_node({
        pop_group_key: "cpa",
        children: [cpa_min_dept_node, cpa_other_portion_node],
        is_expanded: true,
      });

      const separate_agencies_node = pop_group_node({
        pop_group_key: "separate_agencies",
        children: _.chain(orgs)
          .filter({ pop_group_parent_key: "separate_agencies" })
          .map(org_to_node)
          .value(),
      });

      const fps_node = pop_group_node({
        pop_group_key: "fps",
        children: [cpa_node, separate_agencies_node],
        is_expanded: true,
      });

      const na_node = pop_group_node({
        pop_group_key: "na",
        children: _.chain(orgs)
          .filter({ pop_group_gp_key: "na" })
          .map(org_to_node)
          .value(),
      });

      return [fps_node, na_node];
    },
  },
  all: {
    option_name: text_maker("all_orgs"),
    get_nodes: () =>
      _.chain(Dept.store.get_all())
        .map((org) => org_to_node(org, "root"))
        .sortBy("data.name")
        .value(),
  },
};

const create_igoc_hierarchy = (grouping) => {
  const nodes = _.has(grouping_options, grouping)
    ? grouping_options[grouping].get_nodes()
    : grouping_options.all.get_nodes();

  const root = {
    id: "root",
    root: true,
    data: {
      type: "root",
    },
    children: nodes,
  };

  const d3_hierarchy = hierarchy(root, (node) => node.children);
  const flat_nodes = convert_d3_hierarchy_to_explorer_hierarchy(d3_hierarchy);

  return flat_nodes;
};

export { create_igoc_hierarchy, grouping_options };
