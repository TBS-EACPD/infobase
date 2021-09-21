import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

type MinistryDef = {
  id: string;
  name: string;
};

export class Ministry extends BaseSubjectFactory(
  "ministry",
  trivial_text_maker("ministry"),
  trivial_text_maker("ministries")
) {
  static store = make_store((def: MinistryDef) => new Ministry(def));

  id: string;
  name: string;
  description = "";
  orgs = []; // SUBJECT_TS_TODO type this once Dept type is solid

  constructor(def: MinistryDef) {
    super(def);
    this.id = def.id;
    this.name = def.name;
  }
}
