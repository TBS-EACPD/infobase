import _ from "lodash";
import React from "react";


import { Subject } from "src/models/subject.js";

import { trivial_text_maker } from "src/models/text.js";

import { get_resources_for_subject } from "src/explorer_common/resource_explorer_common.js";
import { sanitized_dangerous_inner_html } from "src/general_utils.js";

import { related_tags_row } from "./tag_hierarchy_utils.js";

const { Tag, Ministry, Dept } = Subject;

const tag_configs = _.chain(Tag.tag_roots)
  .omit(["CCOFOG"])
  .map(({ id, name, description, is_m2m, children_tags }) => ({
    id,
    title: name,
    text: description,
    is_m2m,
    can_roll_up: !is_m2m,
    get_depth_one_nodes: (year) =>
      _.map(children_tags, (tag) => ({
        id: tag.guid,
        data: {
          name: tag.name,
          resources: is_m2m ? null : get_resources_for_subject(tag, year),
          subject: tag,
          defs:
            tag.is_lowest_level_tag &&
            _.compact([
              !_.isEmpty(tag.description) && {
                term: trivial_text_maker("description"),
                def: (
                  <div
                    dangerouslySetInnerHTML={sanitized_dangerous_inner_html(
                      tag.description
                    )}
                  />
                ),
              },
              tag.is_m2m &&
                !_.isEmpty(tag.related_tags()) &&
                related_tags_row(tag.related_tags(), "tag"),
            ]),
        },
      })),
  }))
  .value();

const get_org_nodes = (org, year) => ({
  id: org.guid,
  data: {
    name: org.name,
    subject: org,
    resources: get_resources_for_subject(org, year),
  },
});
const min_config = {
  id: "min",
  title: trivial_text_maker("how_were_accountable"),
  text: trivial_text_maker("portfolio_description"),
  is_m2m: false,
  can_roll_up: true,
  get_depth_one_nodes: (year) =>
    _.chain(Ministry.get_all())
      .map((min) => ({
        id: min.guid,
        data: {
          name: min.name,
          subject: min,
          resources: get_resources_for_subject(min, year),
        },
        children: _.map(min.orgs, (org) => get_org_nodes(org, year)),
      }))
      .value(),
};
const dept_config = {
  id: "dept",
  title: trivial_text_maker("organizations_public_funds"),
  text: trivial_text_maker("a_z_list_of_orgs"),
  is_m2m: false,
  can_roll_up: true,
  get_depth_one_nodes: (year) =>
    _.map(Dept.get_all(), (org) => get_org_nodes(org, year)),
};

export const hierarchy_scheme_configs = _.chain([
  min_config,
  dept_config,
  ...tag_configs,
])
  .map((config) => [config.id, config])
  .fromPairs()
  .value();

export const default_scheme_id = "min";
