import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

import { CRSO } from "./CRSO";
import { Dept } from "./Dept";

type ProgramDef = {
  id: string;
  activity_code: string;
  crso_id: string;
  tag_ids: string[];
  description: string;
  name: string;
  old_name: string;
  is_active: boolean;
  is_internal_service: boolean;
  is_fake: boolean;
};

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor
export interface Program extends ProgramDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

export class Program extends BaseSubjectFactory<ProgramDef>(
  "program",
  trivial_text_maker("programs"),
  ["results", "services"]
) {
  static store = make_store((def: ProgramDef) => new Program(def));

  static lookup_by_dept_id_and_activity_code(
    dept_id: string | number,
    activity_code: string
  ) {
    return Program.store.lookup(
      `${Dept.store.lookup(dept_id).dept_code}-${activity_code}`
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
  get link_to_infographic() {
    return `#orgs/program/${this.id}/infograph`;
  }
  get is_dead() {
    return !this.is_active;
  }
}

// SUBJECT_TS_TODO seems like tag roots should probably be their own subjects, although would be hard to hunt down all the logic out there this might confuse
type ProgramTagDef = {
  id: string;
  name: string;
  cardinality?: string;
  description: string;
  parent_tag_id?: string;
  children_tag_ids?: string[];
  program_ids?: string[];
};

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor
export interface ProgramTag extends ProgramTagDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

const find_root = _.memoize(
  (tag: ProgramTag): ProgramTag =>
    tag.parent_tag_id
      ? find_root(ProgramTag.store.lookup(tag.parent_tag_id))
      : tag
);

const root_tag_ids: string[] = [];

export class ProgramTag extends BaseSubjectFactory<ProgramTagDef>(
  "tag",
  trivial_text_maker("tags")
) {
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
  get parent_tag(): ProgramTag | undefined {
    return typeof this.parent_tag_id !== "undefined"
      ? ProgramTag.store.lookup(this.parent_tag_id)
      : undefined;
  }
  get children_tags() {
    return _.map(this.children_tag_ids, ProgramTag.store.lookup);
  }
  get programs() {
    return _.map(this.program_ids, Program.store.lookup);
  }

  get number_of_tagged() {
    return this.programs.length;
  }
  get is_lowest_level_tag() {
    // TODO "lowest level" to me would imply be checking children_tags, not programs, but I think in practice the two are expected to be equivalent, hmm
    // lots of code to check before cleaning this up
    return !_.isEmpty(this.program_ids);
  }
  get has_planned_spending() {
    return (
      this.is_lowest_level_tag &&
      _.some(this.programs, (program) => program.has_planned_spending)
    );
  }
  get planned_spending_gaps() {
    return (
      this.is_lowest_level_tag &&
      _.some(this.programs, (program) => !program.has_planned_spending)
    );
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

  // TODO funky legacy junk, but search configs and the tag explorer at least use it. Should probably review and clean up
  plural() {
    if (this.root_id === "GOCO") {
      if (
        this.parent_tag &&
        _.includes(ProgramTag.tag_roots, this.parent_tag)
      ) {
        return trivial_text_maker("spend_areas");
      } else {
        return trivial_text_maker("gocos");
      }
    } else {
      if (!_.isEmpty(this.programs) && _.isEmpty(this.children_tags)) {
        return trivial_text_maker("tag") + "(s)";
      } else {
        return trivial_text_maker("tag_categories");
      }
    }
  }
}
