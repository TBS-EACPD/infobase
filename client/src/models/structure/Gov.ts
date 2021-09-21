import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";

const gov_id = "gov";

// TODO big pain, a lot of legacy code wants both the class and instance of Gov to be interchangeable...
export class Gov extends BaseSubjectFactory(
  "gov",
  trivial_text_maker("goc"),
  trivial_text_maker("goc")
) {
  static store = { lookup: _.memoize(() => new Gov({ id: gov_id })) };

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
