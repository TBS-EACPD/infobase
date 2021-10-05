import _ from "lodash";
import React from "react";

import { ProgramTag, Dept } from "src/models/subjects";

import { trivial_text_maker } from "src/models/text";

import { get_resources_for_subject } from "src/explorer_common/resource_explorer_common";
import { sanitized_dangerous_inner_html } from "src/general_utils";

import { related_tags_row } from "./tag_hierarchy_utils";

const tag_configs = _.chain(ProgramTag.tag_roots)
  .map(({ id, name, description, is_m2m, children_tags }) => ({
    id,
    title: name,
    text: (
      <div
        dangerouslySetInnerHTML={sanitized_dangerous_inner_html(description)}
      />
    ),
    is_m2m,
    can_roll_up: !is_m2m,
    get_depth_one_nodes: (year) =>
      _.map(children_tags, (tag) => ({
        id: tag.guid,
        data: {
          name: tag.name,
          resources: get_resources_for_subject(tag, year),
          is_m2m: tag.is_m2m,
          subject: tag,
          defs:
            tag.has_programs &&
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
                !_.isEmpty(tag.related_tags) &&
                related_tags_row(tag.related_tags, "tag"),
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
    _.chain(Dept.ministryStore.get_all())
      .map(({ id, name }) => {
        // ministry entites are no longer subject like, the code here was the only place that strongly assumed
        // they were in the first place. TODO refactor here and in get_resources_for_subject to remove need for this shim
        const legacy_ministry_subject_shim = {
          id,
          name,
          guid: `ministry_${id}`,
          subject_type: "ministry",
          orgs: Dept.lookup_by_ministry_id(id),
        };

        return {
          id: legacy_ministry_subject_shim.guid,
          data: {
            name,
            subject: legacy_ministry_subject_shim,
            resources: get_resources_for_subject(
              legacy_ministry_subject_shim,
              year
            ),
          },
          children: _.map(legacy_ministry_subject_shim.orgs, (org) =>
            get_org_nodes(org, year)
          ),
        };
      })
      .value(),
};
const dept_config = {
  id: "dept",
  title: trivial_text_maker("organizations_public_funds"),
  text: trivial_text_maker("a_z_list_of_orgs"),
  is_m2m: false,
  can_roll_up: true,
  get_depth_one_nodes: (year) =>
    _.map(Dept.store.get_all(), (org) => get_org_nodes(org, year)),
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
