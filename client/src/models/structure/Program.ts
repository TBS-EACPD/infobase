import _ from "lodash";

import { Tag } from "src/models/results/Tag";

import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

import { CRSO } from "./CRSO";
import { Dept } from "./Dept";

type ProgramDef = {
  id: string;
  activity_code: string;
  crso_id: string;
  description: string;
  name: string;
  old_name: string;
  is_active: boolean;
  is_internal_service: boolean;
  is_fake: boolean;
};

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor
export interface Program extends ProgramDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

export class Program extends BaseSubjectFactory<ProgramDef>("program", [
  "results",
  "services",
]) {
  static store = make_store((def: ProgramDef) => new Program(def));

  static lookup_by_dept_and_activity_code(
    dept: string | number | Dept, // SUBJECT_TS_TODO: review use cases, may be able to scope this down
    activity_code: string
  ) {
    const dept_code = (() => {
      if (typeof dept === "string" || typeof dept === "number") {
        return Dept.store.lookup(dept).dept_code;
      } else if (typeof dept?.dept_code === "string") {
        return dept.dept_code;
      }
    })();

    return Program.store.lookup(`${dept_code}-${activity_code}`);
  }

  tags: Tag[] = [];

  constructor(def: ProgramDef) {
    super(def);
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
