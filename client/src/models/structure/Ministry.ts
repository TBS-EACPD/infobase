import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

import { Dept } from "./Dept";

type MinistryDef = {
  id: string;
  name: string;
  org_ids: string[];
};

export class Ministry extends BaseSubjectFactory(
  "ministry",
  trivial_text_maker("ministry"),
  trivial_text_maker("ministries")
) {
  static store = make_store((def: MinistryDef) => new Ministry(def));

  id: string;
  name: string;
  org_ids: string[];

  description = ""; // SUBJECT_TS_TODO this was on the old subject, I assume for legacy reasons, but need to poke around before dropping it

  constructor(def: MinistryDef) {
    super(def);
    this.id = def.id;
    this.name = def.name;
    this.org_ids = def.org_ids;
  }

  get orgs() {
    return _.map(this.org_ids, Dept.store.lookup);
  }
}
