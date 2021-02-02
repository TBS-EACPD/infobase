import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import {
  Subject,
  TextPanel,
  util_components,
  infograph_href_template,
  create_text_maker_component,
  declare_panel,
} from "../shared.js";

import { HierarchyDeadElementIcon } from "./hierarchy_component.js";

import hierarchy_text from "./hierarchy_panels.yaml";
import text from "./tags_related_to_subject_panels.yaml";

const { text_maker, TM } = create_text_maker_component([text, hierarchy_text]);
const { Dept, Tag, Program } = Subject;
const { HeightClipper, WellList } = util_components;

const scheme_order = ["GOCO", "WWH", "CCOFOG", "HWH"];

const tag_root_display = (tag_root) => (
  <div>
    <div>{tag_root.name}</div>
    <div className="small-panel-text">{tag_root.description}</div>
  </div>
);

const tag_display = (tag) => ({
  href: infograph_href_template(tag),
  display: tag.name,
});

function get_related_tag_list_args(subject) {
  let tags_by_root_id;
  switch (subject.level) {
    case "program":
      tags_by_root_id = _.groupBy(subject.tags, "root.id");

      break;

    case "dept":
    case "crso":
      tags_by_root_id = _.chain(subject.programs)
        .map("tags")
        .flatten()
        .uniq("id")
        .groupBy("root.id")
        .value();

      break;
  }

  return _.chain(tags_by_root_id)
    .toPairs()
    .reject(([_x, group]) => _.isEmpty(group))
    .sortBy(([id, _group]) => _.indexOf(scheme_order, id))
    .map(([id, tags]) => ({
      display: tag_root_display(Tag.lookup(id)),
      children: _.map(tags, tag_display),
    }))
    .value();
}

const title_by_level = {
  dept: "dept_related_tags_title",
  program: "program_tags_title",
  crso: "crso_tags_title",
};

export const declare_tags_of_interest_panel = () =>
  declare_panel({
    panel_key: "tags_of_interest",
    levels: ["dept", "crso", "program"],
    panel_config_func: (level, panel_key) => ({
      calculate(subject) {
        const tags_by_root = get_related_tag_list_args(subject);
        if (subject.dp_status === false || _.isEmpty(tags_by_root)) {
          return false;
        }

        return tags_by_root;
      },
      render({ calculations }) {
        const { panel_args: tags_by_root, subject } = calculations;

        return (
          <TextPanel title={text_maker(title_by_level[level])}>
            <TM
              k={`${subject.level}_is_tagged_with_following`}
              args={{ subject }}
            />
            <WellList elements={tags_by_root} />
          </TextPanel>
        );
      },
    }),
  });

export const declare_tag_progs_by_dept_panel = () =>
  declare_panel({
    panel_key: "tag_progs_by_dept",
    levels: ["tag"],
    panel_config_func: (level, panel_key) => ({
      calculate: _.constant(true),

      render({ calculations }) {
        const { subject } = calculations;

        const list_args = _.chain(subject.programs)
          .groupBy((prog) => prog.dept.id)
          .map((prog_group, dept_id) => ({
            display: <div>{Dept.lookup(dept_id).name}</div>,
            href: infograph_href_template(Dept.lookup(dept_id)),
            children: _.chain(prog_group)
              .sortBy("is_dead")
              .map((prog) => ({
                display: (
                  <Fragment>
                    {prog.is_dead && <HierarchyDeadElementIcon />}
                    <span
                      className={classNames(prog.is_dead && "dead-element")}
                    >
                      <a href={infograph_href_template(prog)}>{prog.name}</a>
                    </span>
                  </Fragment>
                ),
              }))
              .value(),
          }))
          .value();

        return (
          <TextPanel title={text_maker("tag_progs_by_dept_title")}>
            <div className="col-md-10 col-md-offset-1">
              <HeightClipper clipHeight={250} allowReclip={true}>
                <WellList elements={list_args} />
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
    levels: ["tag"],
    panel_config_func: (level, panel_key) => ({
      calculate(subject) {
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

      render({ calculations }) {
        const {
          panel_args: { related_tags_by_type_with_counts },
        } = calculations;

        const list_args = _.map(
          related_tags_by_type_with_counts,
          ({ type, tag_and_counts }) => ({
            display: tag_root_display(Tag.lookup(type)),
            children: _.map(tag_and_counts, ({ tag, count }) => ({
              href: infograph_href_template(tag),
              display: (
                <span>{`${tag.name} - ${count} ${Program.plural} ${text_maker(
                  "in_common"
                )}`}</span>
              ),
            })),
          })
        );

        return (
          <TextPanel title={text_maker("related_tags_title")}>
            <div className="col-md-10 col-md-offset-1">
              <HeightClipper clipHeight={350} allowReclip={true}>
                <WellList elements={list_args} />
              </HeightClipper>
            </div>
            <div className="clearfix" />
          </TextPanel>
        );
      },
    }),
  });
