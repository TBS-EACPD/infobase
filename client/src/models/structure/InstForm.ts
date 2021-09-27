import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

import { Dept } from "./Dept";

type InstFormDef = {
  id: string;
  name: string;
  parent_id: string;
  children_ids: string[];
  org_ids: string[];
};

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor
export interface InstForm extends InstFormDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

export class InstForm extends BaseSubjectFactory<InstFormDef>(
  "inst_form",
  trivial_text_maker("inst_forms")
) {
  static store = make_store((def: InstFormDef) => new InstForm(def));

  get parent_form() {
    return this.parent_id && InstForm.store.lookup(this.parent_id);
  }
  get children_forms() {
    return _.map(this.children_ids, InstForm.store.lookup);
  }
  get orgs() {
    return _.map(this.org_ids, Dept.store.lookup);
  }
}
