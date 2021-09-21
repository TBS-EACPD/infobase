import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";

/*
  Special case subject! Bit of slight of hand, Gov pretends to be both a subject and a subject instance
  (in reality it's actually a single instance of a not-exported class, but all the normal static subject class methods,
  including a mocked out store, are accessible from the instance).
*/

const gov_id = "gov";

const get_gov = _.memoize(() => new _Gov({ id: gov_id }));

const invalid_gov_store_method = () => {
  throw new Error(
    "The Gov subject store is a mock, does not support create or create_and_register methods!"
  );
};

class _Gov extends BaseSubjectFactory(
  "gov",
  trivial_text_maker("goc"),
  trivial_text_maker("goc")
) {
  // mocked store, note that it's not static because it will always be referenced from the one Gov instance
  store = {
    lookup: get_gov,
    get_all: () => [get_gov()],
    create: invalid_gov_store_method,
    create_and_register: invalid_gov_store_method,
  };

  id = gov_id;
  name = trivial_text_maker("goc");
  description = trivial_text_maker("the_goc");
  legal_title = trivial_text_maker("goc");
  has_planned_spending = true;

  constructor(def: { id: string }) {
    super(def);
  }
}

export const Gov = get_gov();
