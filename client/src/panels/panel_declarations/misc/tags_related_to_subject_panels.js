import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { TextPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  HeightClipper,
  CardList,
} from "src/components/index";

import { Dept, ProgramTag } from "src/models/subjects";

import { sanitized_dangerous_inner_html } from "src/general_utils";

import { infographic_href_template } from "src/infographic/infographic_href_template";

import { HierarchyDeadElementIcon } from "./hierarchy_component";

import hierarchy_text from "./hierarchy_panels.yaml";
import text from "./tags_related_to_subject_panels.yaml";

const { text_maker, TM } = create_text_maker_component([text, hierarchy_text]);

const scheme_order = ["GOCO", "WWH", "HWH"];

const tag_root_display = (tag_root) => (
  <div>
    <div>{tag_root.name}</div>
    <div
      className="small-panel-text"
      dangerouslySetInnerHTML={sanitized_dangerous_inner_html(
        tag_root.description
      )}
    />
  </div>
);

const tag_display = (tag) => ({
  href: infographic_href_template(tag),
  display: tag.name,
});

function get_related_tag_list_args(subject) {
  let tags_by_root_id;
  switch (subject.subject_type) {
    case "program":
      tags_by_root_id = _.groupBy(subject.tags, "root.id");

      break;

    case "dept":
    case "crso":
      tags_by_root_id = _.chain(subject.programs)
        .map("tags")
        .flatten()
        .uniqBy("id")
        .groupBy("root.id")
        .value();

      break;
  }

  return _.chain(tags_by_root_id)
    .toPairs()
    .reject(([_x, group]) => _.isEmpty(group))
    .sortBy(([id, _group]) => _.indexOf(scheme_order, id))
    .map(([id, tags]) => ({
      display: tag_root_display(ProgramTag.store.lookup(id)),
      children: _.map(tags, tag_display),
    }))
    .value();
}

const title_by_subject_type = {
  dept: "dept_related_tags_title",
  program: "program_tags_title",
  crso: "crso_tags_title",
};

export const declare_tags_of_interest_panel = () =>
  declare_panel({
    panel_key: "tags_of_interest",
    subject_types: ["dept", "crso", "program"],
    panel_config_func: (subject_type) => ({
      get_title: () => text_maker(title_by_subject_type[subject_type]),
      calculate: ({ subject }) => {
        const tags_by_root = get_related_tag_list_args(subject);
        if (subject.dp_status === false || _.isEmpty(tags_by_root)) {
          return false;
        }

        return tags_by_root;
      },
      render({ title, subject, calculations }) {
        const tags_by_root = calculations;

        return (
          <TextPanel title={title}>
            <TM
              k={`${subject.subject_type}_is_tagged_with_following`}
              args={{ subject }}
            />
            <CardList elements={tags_by_root} />
          </TextPanel>
        );
      },
    }),
  });

export const declare_tag_progs_by_dept_panel = () =>
  declare_panel({
    panel_key: "tag_progs_by_dept",
    subject_types: ["tag"],
    panel_config_func: () => ({
      get_title: () => text_maker("tag_progs_by_dept_title"),
      render({ title, subject }) {
        const list_args = _.chain(subject.programs)
          .groupBy((prog) => prog.dept.id)
          .map((prog_group, dept_id) => ({
            display: <div>{Dept.store.lookup(dept_id).name}</div>,
            href: infographic_href_template(Dept.store.lookup(dept_id)),
            children: _.chain(prog_group)
              .sortBy("is_dead")
              .map((prog) => ({
                display: (
                  <Fragment>
                    {prog.is_dead && <HierarchyDeadElementIcon />}
                    <span
                      className={classNames(prog.is_dead && "dead-element")}
                    >
                      <a href={infographic_href_template(prog)}>{prog.name}</a>
                    </span>
                  </Fragment>
                ),
              }))
              .value(),
          }))
          .value();

        return (
          <TextPanel title={title}>
            <div className="col-md-10 col-md-offset-1">
              <HeightClipper clipHeight={250} allowReclip={true}>
                <CardList elements={list_args} />
                {_.some(subject.programs, "is_dead") && (
                  <Fragment>
                    <HierarchyDeadElementIcon />
                    <TM k="hierarchy_contains_dead_elements" />
                  </Fragment>
                )}
              </HeightClipper>
            </div>
            <div className="clearfix" />
          </TextPanel>
        );
      },
    }),
  });

export const declare_related_tags_panel = () =>
  declare_panel({
    panel_key: "related_tags",
    subject_types: ["tag"],

    panel_config_func: () => ({
      get_title: () => text_maker("related_tags_title"),
      calculate: ({ subject }) => {
        const related_tags_by_type_with_counts = _.chain(subject.programs)
          .map((prog) => prog.tags)
          .flatten()
          .reject({ id: subject.id })
          .groupBy((tag) => tag.id)
          .map((group) => ({
            tag: _.first(group),
            count: group.length,
            type: _.first(group).root.id,
          }))
          .filter("count")
          .groupBy("type")
          .map((group_of_tags, type) => ({
            tag_and_counts: _.chain(group_of_tags)
              .sortBy((obj) => obj.tag.name)
              .sortBy((obj) => -obj.count)
              .take(10)
              .value(),
            type,
          }))
          .sortBy(({ type }) => _.indexOf(scheme_order, type))
          .value();

        if (_.isEmpty(related_tags_by_type_with_counts)) {
          return false;
        }

        return {
          related_tags_by_type_with_counts,
        };
      },

      render({ title, calculations }) {
        const { related_tags_by_type_with_counts } = calculations;

        const list_args = _.map(
          related_tags_by_type_with_counts,
          ({ type, tag_and_counts }) => ({
            display: tag_root_display(ProgramTag.store.lookup(type)),
            children: _.map(tag_and_counts, ({ tag, count }) => ({
              href: infographic_href_template(tag),
              display: (
                <span>{`${tag.name} - ${count} ${text_maker(
                  "programs"
                )} ${text_maker("in_common")}`}</span>
              ),
            })),
          })
        );

        return (
          <TextPanel title={title}>
            <div className="col-md-10 col-md-offset-1">
              <HeightClipper clipHeight={350} allowReclip={true}>
                <CardList elements={list_args} />
              </HeightClipper>
            </div>
            <div className="clearfix" />
          </TextPanel>
        );
      },
    }),
  });
