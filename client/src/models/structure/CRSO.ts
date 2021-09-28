import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

import { Dept } from "./Dept";
import { Program } from "./Program";

type CRSODef = {
  id: string;
  activity_code: string;
  dept_id: string;
  program_ids: string[];
  name: string;
  description?: string;
  is_active: boolean;
  is_drf: boolean;
  is_internal_service: boolean;
};

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor
export interface CRSO extends CRSODef {} // eslint-disable-line @typescript-eslint/no-empty-interface

export class CRSO extends BaseSubjectFactory<CRSODef>(
  "crso",
  trivial_text_maker("core_resps"),
  ["results", "services"]
) {
  static store = make_store((def: CRSODef) => new CRSO(def));

  get dept() {
    return Dept.store.lookup(this.dept_id);
  }
  get programs() {
    return _.map(this.program_ids, Program.store.lookup);
  }

  get has_planned_spending() {
    return _.some(this.programs, (program) => program.has_planned_spending);
  }
  get is_cr() {
    return this.is_drf;
  }
  get is_dead() {
    return !this.is_active;
  }
}
