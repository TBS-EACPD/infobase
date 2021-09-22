import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

type MinisterDef = {
  id: string;
  name: string;
};

export class Minister extends BaseSubjectFactory(
  "minister",
  trivial_text_maker("minister"),
  trivial_text_maker("minister")
) {
  static store = make_store((def: MinisterDef) => new Minister(def));

  id: string;
  name: string;
  description = "";

  constructor(def: MinisterDef) {
    super(def);
    this.id = def.id;
    this.name = def.name;
  }
}
