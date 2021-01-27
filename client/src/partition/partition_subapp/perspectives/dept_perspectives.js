import { hierarchy } from "d3-hierarchy";
import _ from "lodash";

import { Subject } from "../../../models/subject.js";
import { text_maker } from "../partition_text_provider.js";

import {
  absolute_value_sort,
  post_traversal_value_set,
  post_traversal_search_string_set,
} from "./data_hierarchy_utils.js";
import { PartitionPerspective } from "./PartitionPerspective.js";

import {
  get_common_popup_options,
  wrap_in_brackets,
  formats_by_data_type,
} from "./perspective_utils.js";

// Would like to change the use of dept in this perspective to "ministry", but the use of dept is grandparented in to the route itself...

const create_ministry_hierarchy = function (data_type, skip_crsos = true) {
  return hierarchy(Subject.gov, (node) => {
    if (node.is("gov")) {
      return Subject.Ministry.get_all();
    } else if (node.is("ministry")) {
      return node.orgs;
    } else if (node.is("dept")) {
      if (skip_crsos) {
        return _.reduce(
          node.crsos,
          (memo, crso) => memo.concat(crso.programs),
          []
        );
      } else {
        return node.crsos;
      }
    } else if (!skip_crsos && node.is("crso")) {
      return node.programs;
    }
  })
    .eachAfter((node) => {
      post_traversal_value_set(node, data_type);
      post_traversal_search_string_set(node);
    })
    .sort(absolute_value_sort);
};

const dept_data_wrapper_node_rules = (node) => {
  node.__value__ = node.value;
  node.open = true;
  if (node.data.is("gov")) {
    node.how_many_to_show = 8;
  } else if (
    node.data.is("ministry") ||
    node.data.is("dept") ||
    node.data.is("crso")
  ) {
    const root_value = _.last(node.ancestors()).value;

    node.how_many_to_show = function (_node) {
      if (_node.children.length === 2) {
        return [_node.children, []];
      }
      const show = [_.head(_node.children)];
      const hide = _.tail(_node.children);
      const unhide = _.filter(
        hide,
        (__node) => Math.abs(__node.value) > root_value / 50
      );
      return [show.concat(unhide), _.difference(hide, unhide)];
    };
  }
};

const dept_perspective_popup_template = function (d) {
  const common_popup_options = get_common_popup_options(d);
  if (d.data.is("program")) {
    return text_maker(
      "partition_program_popup",
      _.extend(common_popup_options, {
        description: d.data.description,
        dept_name: d.data.dept.name,
        dept_id: d.data.dept.id,
      })
    );
  } else if (d.data.is("dept")) {
    return text_maker(
      "partition_org_or_goco_popup",
      _.extend(common_popup_options, {
        description: d.data.mandate,
      })
    );
  } else if (d.data.is("ministry")) {
    return text_maker("partition_ministry_or_sa_popup", common_popup_options);
  }
};

const dept_perspective_factory = (data_type) =>
  new PartitionPerspective({
    id: "dept",
    name: text_maker("ministries"),
    data_type: data_type,
    formatter: (node_data) =>
      wrap_in_brackets(formats_by_data_type[data_type](node_data[data_type])),
    hierarchy_factory: () => create_ministry_hierarchy(data_type),
    data_wrapper_node_rules: dept_data_wrapper_node_rules,
    level_headers: {
      "1": text_maker("ministry"),
      "2": text_maker("org"),
      "3": text_maker("program"),
    },
    popup_template: dept_perspective_popup_template,
    root_text_func: (root_value) => {
      const text_key =
        data_type === "exp" ? "partition_spending_was" : "partition_fte_was";
      return text_maker(text_key, { x: root_value });
    },
  });

const make_dept_exp_perspective = () => dept_perspective_factory("exp");

const make_dept_fte_perspective = () => dept_perspective_factory("fte");

export { make_dept_exp_perspective, make_dept_fte_perspective };
