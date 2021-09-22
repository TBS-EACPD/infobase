import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

type InstFormDef = {
  id: string;
  name: string;
  parent_form?: InstForm;
  children_forms: InstForm[];
  orgs: any[]; // SUBJECT_TS_TODO type this once Dept type is solid
};

export class InstForm extends BaseSubjectFactory(
  "inst_form",
  trivial_text_maker("inst_form"),
  trivial_text_maker("inst_forms")
) {
  static store = make_store((def: InstFormDef) => new InstForm(def));

  id: string;
  name: string;
  parent_form: InstForm | undefined = undefined;
  children_forms: InstForm[] = [];
  orgs = []; // SUBJECT_TS_TODO type this once Dept type is solid

  constructor(def: InstFormDef) {
    super(def);
    this.id = def.id;
    this.name = def.name;
  }
}
