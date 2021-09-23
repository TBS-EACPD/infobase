import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

import { Dept } from "./Dept";

type ProgramDef = {
  id: string; // SUBJECT_TS_TODO add to populate_store.js
  crso: any; // SUBJECT_TS_TODO type this once CRSO type is solid
  activity_code: string;
  dept: any; // SUBJECT_TS_TODO type this once Dept type is solid
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
  trivial_text_maker("program"),
  trivial_text_maker("programs"),
  ["results", "services"]
) {
  static store = make_store((def: ProgramDef) => new Program(def));

  static lookup_by_dept_and_activity_code(
    dept: string | number | Dept, // TODO: review use cases, may be able to scope this down
    activity_code: string
  ) {
    const dept_code = (() => {
      if (typeof dept === "string" || typeof dept === "number") {
        return Dept.store.lookup(dept)?.dept_code;
      } else if (typeof dept?.dept_code === "string") {
        return dept.dept_code;
      } // SUBJECT_TS_TODO decide if I want to throw here, need to survey use cases to see if they ever expect to fail
    })();

    return Program.store.lookup(`${dept_code}-${activity_code}`);
  }

  tags: any[] = [];

  constructor(def: ProgramDef) {
    super(def);
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
