import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";

const gov_id = "gov";

const get_gov = _.memoize(() => new Gov({ id: gov_id }));

const invalid_gov_store_method = () => {
  throw new Error(
    "The Gov subject store is a mock, does not support create or create_and_register methods!"
  );
};

// TODO big pain, a lot of legacy code wants both the class and instance of Gov to be interchangeable,
// have to do some trickery with doubling up static and instance decorators and mocking up a store
export class Gov extends BaseSubjectFactory(
  "gov",
  trivial_text_maker("goc"),
  trivial_text_maker("goc")
) {
  static store = {
    lookup: get_gov,
    get_all: () => [get_gov()],
    create: invalid_gov_store_method,
    create_and_register: invalid_gov_store_method,
  };

  static id = gov_id;

  static description = trivial_text_maker("the_goc");
  get description() {
    return Gov.description;
  }

  static legal_title = trivial_text_maker("goc");
  get legal_title() {
    return Gov.legal_title;
  }

  static has_planned_spending = true;
  get has_planned_spending() {
    return Gov.has_planned_spending;
  }

  constructor(def: { id: string }) {
    super(def);
  }
}
