import _ from "lodash";

import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

import { Dept } from "./Dept";

type MinistryDef = {
  id: string;
  name: string;
  org_ids: string[];
};

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor
export interface Ministry extends MinistryDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

export class Ministry extends BaseSubjectFactory<MinistryDef>("ministry") {
  static store = make_store((def: MinistryDef) => new Ministry(def));

  constructor(def: MinistryDef) {
    super(def);
  }

  get orgs() {
    return _.map(this.org_ids, Dept.store.lookup);
  }
}
