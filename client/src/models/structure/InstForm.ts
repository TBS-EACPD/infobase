import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

import { Dept } from "./Dept";

type InstFormDef = {
  id: string;
  name: string;
  parent_id?: string;
  children_ids: string[];
  org_ids: string[];
};

export class InstForm extends BaseSubjectFactory(
  "inst_form",
  trivial_text_maker("inst_form"),
  trivial_text_maker("inst_forms")
) {
  static store = make_store((def: InstFormDef) => new InstForm(def));

  id: string;
  name: string;
  parent_id?: string;
  children_ids: string[];
  org_ids: string[];

  constructor(def: InstFormDef) {
    super(def);
    this.id = def.id;
    this.name = def.name;
    this.parent_id = def.parent_id;
    this.children_ids = def.children_ids;
    this.org_ids = def.org_ids;
  }

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
