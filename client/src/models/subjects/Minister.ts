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

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor
export interface Minister extends MinisterDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

export class Minister extends BaseSubjectFactory<MinisterDef>(
  "minister",
  trivial_text_maker("minister")
) {
  static store = make_store((def: MinisterDef) => new Minister(def));

  get orgs() {
    return _.map(this.org_ids, Dept.store.lookup);
  }
}
