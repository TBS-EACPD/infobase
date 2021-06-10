import _ from "lodash";
import React from "react";

import { create_full_results_hierarchy } from "src/panels/panel_declarations/results/result_drilldown/result_hierarchies";

import { text_maker } from "src/panels/panel_declarations/results/result_text_provider";

import {
  status_key_to_glossary_key,
  ordered_status_keys,
  result_color_scale,
} from "src/panels/panel_declarations/results/results_common";

import { toggle_list } from "src/general_utils";
import {
  IconCheck,
  IconAttention,
  IconNotApplicable,
  IconClock,
} from "src/icons/icons";

import { FilterTable } from "./FilterTable";

export default {
  title: "Input/FilterTable",
  component: FilterTable,
};

const Template = (args) => <FilterTable {...args} />;

const active_list = [];
const status_active_list = [];
const subject = "subject";
const last_drr_doc = "last_drr_doc";

const result_status_icon_components = (status, width) => {
  const icons = {
    met: (
      <IconCheck
        key="met"
        title={text_maker("met")}
        color={result_color_scale("met")}
        width={width}
        svg_style={{ verticalAlign: "0em" }}
        alternate_color={false}
        inline={false}
      />
    ),
    not_met: (
      <IconAttention
        key="not_met"
        title={text_maker("not_met")}
        color={result_color_scale("not_met")}
        width={width}
        svg_style={{ verticalAlign: "0em" }}
        alternate_color={false}
        inline={false}
      />
    ),
    not_available: (
      <IconNotApplicable
        key="not_available"
        title={text_maker("not_available")}
        color={result_color_scale("not_available")}
        width={width}
        svg_style={{ verticalAlign: "0em" }}
        alternate_color={false}
        inline={false}
      />
    ),
    future: (
      <IconClock
        key="future"
        title={text_maker("future")}
        color={result_color_scale("future")}
        width={width}
        svg_style={{ verticalAlign: "0em" }}
        alternate_color={false}
        inline={false}
      />
    ),
  };
  return icons[status];
};

const make_status_icons = (width) => {
  return _.chain(ordered_status_keys)
    .map((status_key) => [
      status_key,
      result_status_icon_components(status_key, width),
    ])
    .fromPairs()
    .value();
};

const large_status_icons = make_status_icons("41px");

const get_actual_parent = (indicator_node, full_results_hierarchy) => {
  const parent = _.find(full_results_hierarchy, {
    id: indicator_node.parent_id,
  });
  if (_.includes(["cr", "program"], parent.data.type)) {
    return parent;
  } else if (parent.data.type === "dr" || parent.data.type === "result") {
    return get_actual_parent(parent, full_results_hierarchy);
  } else {
    throw new Error(
      `Result component ${indicator_node} has no (sub)program or CR parent`
    );
  }
};

const get_indicators = (subject, doc) => {
  const full_results_hierarchy = create_full_results_hierarchy({
    subject_guid: subject.guid,
    doc,
    allow_no_result_branches: false,
  });
  return _.chain(full_results_hierarchy)
    .filter((node) => node.data.type === "indicator")
    .map((indicator_node) => ({
      ...indicator_node.data,
      parent_node: get_actual_parent(indicator_node, full_results_hierarchy),
    }))
    .value();
};

const flat_indicators = get_indicators(subject, last_drr_doc);
const icon_counts = _.countBy(
  flat_indicators,
  ({ indicator }) => indicator.status_key
);

const toggle_status_status_key = (status_key) =>
  this.setState({
    status_active_list: toggle_list(status_active_list, status_key),
  });

const items = _.map(ordered_status_keys, (status_key) => ({
  key: status_key,
  active: active_list.length === 0 || _.indexOf(active_list, status_key) !== -1,
  count: icon_counts[status_key] || 0,
  text: (
    <span
      className="link-unstyled"
      tabIndex={-1}
      aria-hidden="true"
      data-toggle="tooltip"
      data-ibtt-glossary-key={status_key_to_glossary_key[status_key]}
    >
      {text_maker(status_key)}
    </span>
  ),
  aria_text: text_maker(status_key),
  icon: large_status_icons[status_key],
}));

export const Basic = Template.bind({});
Basic.args = {
  items,
  item_component_order: ["count", "icon", "text"],
  click_callback: (status_key) => toggle_status_status_key(status_key),
  show_eyes_override: active_list.length === ordered_status_keys.length,
};
