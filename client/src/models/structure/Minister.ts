import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

import { Dept } from "./Dept";

type MinisterDef = {
  id: string;
  name: string;
  org_ids: string[];
};

export class Minister extends BaseSubjectFactory(
  "minister",
  trivial_text_maker("minister"),
  trivial_text_maker("minister")
) {
  static store = make_store((def: MinisterDef) => new Minister(def));

  id: string;
  name: string;
  org_ids: string[];

  description = ""; // SUBJECT_TS_TODO this was on the old subject, I assume for legacy reasons, but need to poke around before dropping it

  constructor(def: MinisterDef) {
    super(def);
    this.id = def.id;
    this.name = def.name;
    this.org_ids = def.org_ids;
  }

  get orgs() {
    return _.map(this.org_ids, Dept.store.lookup);
  }
}
