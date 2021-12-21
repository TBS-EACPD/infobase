import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import { make_store } from "src/models/utils/make_store";

import { sanitized_marked } from "src/general_utils";

import { BaseSubjectFactory } from "./BaseSubjectFactory";

import { CRSO } from "./CRSO";
import { Dept } from "./Dept";

type ProgramDef = {
  id: string;
  activity_code: string;
  crso_id: string;
  tag_ids: string[];
  description: string;
  name: string;
  old_name?: string;
  is_active: boolean;
  is_internal_service: boolean;
  is_fake: boolean;
};

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor, pending future TS features
export interface Program extends ProgramDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

// Another quirk with BaseSubjectFactory, subject_type's mustbe const and provided in the generic type and value arguments, pending future TS features
const program_subject_type = "program" as const;

export class Program extends BaseSubjectFactory<
  ProgramDef,
  typeof program_subject_type
>(program_subject_type, trivial_text_maker("programs"), [
  "results",
  "services",
]) {
  static store = make_store((def: ProgramDef) => new Program(def));

  static make_program_id(dept_code: string, activity_code: string) {
    return `${dept_code}-${activity_code}`;
  }
  static lookup_by_dept_id_and_activity_code(
    dept_id: string | number,
    activity_code: string
  ) {
    const { dept_code } = Dept.store.lookup(dept_id);

    if (typeof dept_code === "undefined") {
      throw new Error(`
        Tried to look up a program with activity code "${activity_code}" for the dept "${dept_id}".
        This department does not have a dept_code property, and therfore can't have programs.
      `);
    }

    return Program.store.lookup(
      Program.make_program_id(dept_code, activity_code)
    );
  }

  get crso() {
    return CRSO.store.lookup(this.crso_id);
  }
  get dept_id() {
    return this.crso.dept.id;
  }
  get dept() {
    return this.crso.dept;
  }

  get tags() {
    return _.map(this.tag_ids, ProgramTag.store.lookup);
  }
  get tags_by_scheme() {
    return _.groupBy(this.tags, (tag) => tag.root.id);
  }

  get has_planned_spending() {
    return this.dept.has_planned_spending;
  }
  get is_dead() {
    return !this.is_active;
  }
}

type ProgramTagDef = {
  id: string;
  name: string;
  cardinality?: string;
  description_raw?: string;
  parent_tag_id?: string;
  children_tag_ids?: string[];
  program_ids?: string[];
};

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor, pending future TS features
export interface ProgramTag extends ProgramTagDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

const find_root = _.memoize(
  (tag: ProgramTag): ProgramTag =>
    typeof tag.parent_tag_id !== "undefined"
      ? find_root(ProgramTag.store.lookup(tag.parent_tag_id))
      : tag
);

const root_tag_ids: string[] = [];

// Another quirk with BaseSubjectFactory, subject_type's mustbe const and provided in the generic type and value arguments, pending future TS features
const program_tag_subject_type = "tag" as const;

export class ProgramTag extends BaseSubjectFactory<
  ProgramTagDef,
  typeof program_tag_subject_type
>(program_tag_subject_type, trivial_text_maker("tags")) {
  static store = make_store((def: ProgramTagDef) => {
    return new ProgramTag(def);
  });

  static get tag_roots() {
    return _.map(root_tag_ids, ProgramTag.store.lookup);
  }
  static get tag_roots_by_id() {
    return _.chain(ProgramTag.tag_roots)
      .map((tag_root) => [tag_root.id, tag_root])
      .fromPairs()
      .value();
  }

  constructor(def: ProgramTagDef) {
    super(def);

    if (typeof def.parent_tag_id === "undefined") {
      root_tag_ids.push(def.id);
    }
  }

  get root() {
    return find_root(this);
  }
  get root_id() {
    return this.root.id;
  }
  get is_root_tag() {
    return _.includes(root_tag_ids, this.id);
  }
  get parent_tag(): ProgramTag | undefined {
    return typeof this.parent_tag_id !== "undefined"
      ? ProgramTag.store.lookup(this.parent_tag_id)
      : undefined;
  }
  get children_tags() {
    return _.map(this.children_tag_ids, ProgramTag.store.lookup);
  }
  get has_children() {
    return !_.isEmpty(this.children_tag_ids);
  }
  get programs() {
    return _.map(this.program_ids, Program.store.lookup);
  }
  get has_programs() {
    return !_.isEmpty(this.program_ids);
  }

  get description() {
    if (this.description_raw) {
      return sanitized_marked(this.description_raw);
    }
  }
  get is_m2m() {
    return this.root.cardinality === "MtoM";
  }
  get related_tags() {
    return _.chain(this.programs)
      .map((prog) => prog.tags)
      .flatten()
      .filter((tag) => tag.root_id === this.root_id)
      .uniq()
      .without(this)
      .value();
  }
  get has_planned_spending() {
    return _.some(this.programs, (program) => program.has_planned_spending);
  }
}
