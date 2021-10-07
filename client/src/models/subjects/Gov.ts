import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import { make_store } from "src/models/utils/make_store";

import { BaseSubjectFactory } from "./BaseSubjectFactory";

const gov_id = "gov";

export class Gov extends BaseSubjectFactory("gov", trivial_text_maker("goc")) {
  static store = (() => {
    const store = make_store((def: { id: string }) => new Gov(def));
    store.create_and_register({ id: gov_id });
    return store;
  })();

  static instance = Gov.store.lookup(gov_id);

  name = trivial_text_maker("goc");
  description = trivial_text_maker("the_goc");
  legal_title = trivial_text_maker("goc");
  has_planned_spending = true;
}
