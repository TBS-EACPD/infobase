import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { create_text_maker_component } from "src/components/index";

import { Gov, Dept } from "src/models/subjects";

import { lang } from "src/core/injected_build_constants";

import { IconAttentionTriangle } from "src/icons/icons";
import { highlightColor } from "src/style_constants/index";

import text from "./hierarchy_panels.yaml";

const { text_maker, TM } = create_text_maker_component(text);

/* 
  This component helps put a subject in context.

  If it's a Department, Program or CR, it will show the department's full inventory,
  placing the current_subject element first. It is recommended that consumers clip the height of this component, 
  since Fisheries and Ocean has like 36 programs! 

  If it's a tag, instead of showing all programs, it will just show ancestors, like so

    GoC
      - Program Tags
        - How we help
          - Contribution


  This component was not designed with government-wide in mind.

*/

export const HierarchyDeadElementIcon = () => (
  <IconAttentionTriangle
    aria_label={text_maker("hierarchy_dead_element_icon_alt_text")}
    color={highlightColor}
    inline={true}
    alternate_color={false}
  />
);

const hierarchical_some = (node, predicate) => {
  const predicate_func = _.isFunction(predicate)
    ? predicate
    : (node) => _.get(node, predicate);

  if (predicate_func(node)) {
    return true;
  } else if (!_.isEmpty(node.children)) {
    return _.chain(node.children)
      .map((child) => hierarchical_some(child, predicate_func))
      .some()
      .value();
  } else {
    return false;
  }
};
const has_elements_with_limited_data = (root) =>
  hierarchical_some(root, "limited_data");
const has_dead_elements = (root) => hierarchical_some(root, "dead");

function sort_by_name_current_subject_dead(nodes) {
  return _.chain(nodes)
    .sortBy("name")
    .sortBy((node) => !node.current_subject)
    .sortBy("dead")
    .value();
}

export const HierarchyPeek = ({ root }) => {
  const limited_data_elements = has_elements_with_limited_data(root);
  const dead_elements = has_dead_elements(root);

  // Legend text selection is based on the assumption that only the external org hierarchy (panel in org about panel) can
  // have items with limited data. If that changes, the legend text selection here will likely become inaccurate. Dealing
  // with this better's a TODO
  return (
    <div>
      <_HierarchyPeek root={root} />
      {limited_data_elements && (
        <Fragment>
          <HierarchyDeadElementIcon />
          <TM k="hierarchy_contains_elements_with_limited_data" />
        </Fragment>
      )}
      {!limited_data_elements && dead_elements && (
        <Fragment>
          <HierarchyDeadElementIcon />
          <TM k="hierarchy_contains_dead_elements" />
        </Fragment>
      )}
    </div>
  );
};

/* Recursive child helper */
const _HierarchyPeek = ({ root }) => (
  <div>
    {!root.current_subject ? (
      <Fragment>
        {(root.dead || root.limited_data) && <HierarchyDeadElementIcon />}
        <span className={classNames(root.dead && "dead-element")}>
          {root.href ? (
            <a href={root.href}>
              {root.subject_type === "crso"
                ? root.is_cr && !root.dead
                  ? lang == "en"
                    ? `Core Responsibility : ${root.name}`
                    : `Responsabilité Essentielle : ${root.name}`
                  : lang == "en"
                  ? `Strategic Outcome : ${root.name}`
                  : `Résultat Stratégique : ${root.name}`
                : root.name}
            </a>
          ) : (
            <span>{root.name}</span>
          )}
        </span>
      </Fragment>
    ) : (
      <Fragment>
        {(root.dead || root.limited_data) && <HierarchyDeadElementIcon />}
        <span className={classNames(root.dead && "dead-element")}>
          {root.name}
        </span>
      </Fragment>
    )}
    {root.children && !_.isEmpty(root.children) && (
      <ul>
        {_.map(root.children, (child, index) => (
          <li key={index}>
            <_HierarchyPeek root={child} />
          </li>
        ))}
      </ul>
    )}
  </div>
);

/*
  Gov
    Min
      Inst forms
        Orgs
*/
export const org_external_hierarchy = ({ subject, href_generator }) => {
  const is_subject = (subj) => subj === subject;
  return {
    name: text_maker("goc"),
    href: href_generator(Gov.instance),
    children: !subject.ministry
      ? [
          {
            name: subject.name,
            current_subject: true,
          },
        ]
      : [
          {
            name: `${subject.ministry.name} (${text_maker("ministry")})`,
            children: _.chain(Dept.lookup_by_ministry_id(subject.ministry_id))
              .filter((node) => !node.is_dead || is_subject(node))
              .groupBy("inst_form.name")
              .toPairs()
              .sortBy(([_type, group]) => _.includes(group, subject))
              .reverse()
              .map(([type, orgs]) => ({
                name: type,
                children: _.chain(orgs)
                  .sortBy((org) => is_subject(org))
                  .reverse()
                  .map((org) => ({
                    name: org.name,
                    current_subject: is_subject(org),
                    href: href_generator(org),
                    dead: org.is_dead,
                    limited_data: !org.has_table_data,
                  }))
                  .thru((orgs) => sort_by_name_current_subject_dead(orgs))
                  .value(),
              }))
              .sortBy("name")
              .value(),
          },
        ],
  };
};

/*
  org
    CRSOs
      programs
*/
export const org_internal_hierarchy = ({
  subject,
  href_generator,
  show_dead_sos,
}) => ({
  name: subject.name,
  current_subject: true,
  children: _.chain(subject.crsos)
    .filter(show_dead_sos ? _.constant(true) : "is_active")
    .map((crso) => ({
      name: crso.name,
      is_cr: crso.is_cr,
      href: crso.is_cr && href_generator(crso),
      dead: !crso.is_active,
      children: _.chain(crso.programs)
        .filter((program) => !program.is_fake)
        .map((prog) => ({
          name: prog.name,
          href: href_generator(prog),
          dead: !prog.is_active,
        }))
        .thru((programs) => sort_by_name_current_subject_dead(programs))
        .value(),
    }))
    .thru((crsos) => sort_by_name_current_subject_dead(crsos))
    .value(),
});

export const program_hierarchy = ({
  subject,
  href_generator,
  show_siblings,
  show_uncles,
  show_cousins,
  show_dead_sos,
}) => {
  const is_subject = (subj) => subj === subject;
  const is_parent = (subj) => subj === subject.crso;

  const dept_node = [
    {
      name: subject.dept.name,
      href: href_generator(subject.dept),
      children: _.chain(subject.dept.crsos) //CRSO (parent + uncles)
        .filter(show_uncles ? _.constant(true) : is_parent)
        .filter(show_dead_sos ? _.constant(true) : "is_active")
        .sortBy("is_active")
        .sortBy(is_parent)
        .reverse()
        .map((crso) => ({
          name: crso.name,
          href: crso.is_cr && href_generator(crso),
          dead: !crso.is_active,
          children:
            show_cousins || is_parent(crso)
              ? _.chain(crso.programs)
                  .filter(show_siblings ? _.constant(true) : is_subject)
                  .filter((program) => !program.is_fake)
                  .map((prog) => ({
                    name: prog.name,
                    current_subject: is_subject(prog),
                    href: href_generator(prog),
                    dead: !prog.is_active,
                  }))
                  .thru((programs) =>
                    sort_by_name_current_subject_dead(programs)
                  )
                  .value()
              : null,
        }))
        .thru((crsos) => sort_by_name_current_subject_dead(crsos))
        .value(),
    },
  ];

  const ministry_node = subject.dept.ministry && [
    {
      name: `${subject.dept.ministry.name} (${text_maker("ministry")})`,
      children: dept_node,
    },
  ];

  return {
    name: text_maker("goc"),
    href: href_generator(Gov.instance),
    children: ministry_node || dept_node,
  };
};

/* 
  the following is hacky because we don't know how many levels there are between a tag and government.
*/
export const tag_hierarchy = ({
  subject,
  showSiblings,
  showChildren,
  href_generator,
}) => {
  const is_subject = (subj) => subj === subject;

  const leaf_nodes = _.chain(subject.parent_tag.children_tags)
    .filter(showSiblings ? _.constant(true) : is_subject)
    .map((tag) => ({
      name: tag.name,
      href: href_generator(tag),
      current_subject: is_subject(tag),
      children:
        showChildren &&
        is_subject(tag) &&
        _.chain(tag.programs)
          .filter((program) => !program.is_fake)
          .map((prog) => ({
            name: prog.name,
            href: href_generator(prog),
            dead: !prog.is_active,
          }))
          .thru((programs) => sort_by_name_current_subject_dead(programs))
          .value(),
    }))
    .thru((tags) => sort_by_name_current_subject_dead(tags))
    .value();

  const parent_node = {
    name: subject.parent_tag.name,
    children: leaf_nodes,
  };

  let current_structure = parent_node;
  let current_node = subject.parent_tag;
  //[Gov, tagging_scheme, (...intermediate parents), subject ]
  while (current_node.parent_tag) {
    current_structure = {
      name: current_node.parent_tag.name,
      children: [current_structure],
    };
    current_node = current_node.parent_tag;
  }

  return {
    name: text_maker("goc"),
    children: [current_structure],
  };
};

export const crso_hierarchy = ({ subject, href_generator }) => {
  //From Gov to programs under CRSO
  const is_subject = (subj) => subj === subject;

  return {
    name: text_maker("goc"),
    href: href_generator(Gov.instance),
    children: [
      {
        //ministry
        name: `${subject.dept.ministry.name} (${text_maker("ministry")})`,
        level: "ministry",
        children: [
          {
            //dept
            name: subject.dept.name,
            href: href_generator(subject.dept),
            level: subject.dept.subject_type,
            //crso
            children: _.chain(subject.dept.crsos)
              .map((crso) => ({
                level: crso.subject_type,
                name: crso.name,
                is_cr: crso.is_cr,
                href: crso.is_cr && href_generator(crso),
                current_subject: is_subject(crso),
                dead: !crso.is_active,
                //program
                children: _.chain(crso.programs)
                  .filter((program) => !program.is_fake)
                  .map((prg) => ({
                    level: prg.subject_type,
                    name: prg.name,
                    href: href_generator(prg),
                    dead: prg.is_dead,
                  }))
                  .thru((programs) =>
                    sort_by_name_current_subject_dead(programs)
                  )
                  .value(),
              }))
              .thru((crsos) => sort_by_name_current_subject_dead(crsos))
              .value(),
          },
        ],
      },
    ],
  };
};

export const crso_pi_hierarchy = ({ subject, href_generator }) => ({
  name: text_maker("goc"),
  href: href_generator(Gov.instance),
  children: [
    {
      //ministry
      name: `${subject.dept.ministry.name} (${text_maker("ministry")})`,
      level: "ministry",
      children: [
        {
          //dept
          name: subject.dept.name,
          href: href_generator(subject.dept),
          level: subject.dept.subject_type,
          children: [
            {
              //crso
              subject_type: subject.subject_type,
              name: subject.name,
              current_subject: true,
              is_cr: subject.is_cr,
              href: href_generator(subject),
              // program
              children: _.chain(subject.programs)
                .filter((program) => !program.is_fake)
                .map((prg) => ({
                  level: prg.subject_type,
                  name: prg.name,
                  href: href_generator(prg),
                  dead: !prg.is_active,
                }))
                .thru((programs) => sort_by_name_current_subject_dead(programs))
                .value(),
            },
          ],
        },
      ],
    },
  ],
});

export const crso_gov_hierarchy = ({ subject, href_generator }) => {
  const is_subject = (subj) => subj === subject;

  return {
    name: text_maker("goc"),
    href: href_generator(Gov.instance),
    children: [
      {
        //ministry
        name: `${subject.dept.ministry.name} (${text_maker("ministry")})`,
        level: "ministry",
        children: [
          {
            //dept
            name: subject.dept.name,
            href: href_generator(subject.dept),
            level: subject.dept.subject_type,
            //crso
            children: _.chain(subject.dept.crsos)
              .filter("is_active")
              .map((crso) => ({
                level: crso.subject_type,
                name: crso.name,
                href: crso.is_cr && href_generator(crso),
                current_subject: is_subject(crso),
              }))
              .thru((crsos) => sort_by_name_current_subject_dead(crsos))
              .value(),
          },
        ],
      },
    ],
  };
};
