import _ from "lodash";

import { create_re_matcher } from "./search_utils.js";

export default function define_core_subjects(model_singleton) {
  const { models } = model_singleton;

  let _subjects_with_data;
  let _all_subjects;

  class SubjectSearch {
    static search_subjects(query) {
      const filter_func = create_re_matcher(query, [
        "name",
        "legal_title",
        "applied_title",
        "acronym",
      ]);
      return _.filter(_all_subjects, filter_func);
    }
    static search_subjects_with_data(query) {
      const filter_func = create_re_matcher(query, [
        "name",
        "legal_title",
        "applied_title",
        "acronym",
      ]);
      return _.filter(_subjects_with_data, filter_func);
    }
    static init() {
      /* 
        1. set up the subjects w/ data structure
        2. set up other structures

      */

      const { Org, Program } = models;

      const orgs = models.Org.all_with_dept_code();
      const progs = _.chain(orgs)
        .flatMap("programs")
        .filter("is_active")
        .value();

      _subjects_with_data = orgs.concat(progs);

      _all_subjects = Org.all().concat(Program.all());
    }
  }

  model_singleton.define("SubjectSearch", SubjectSearch);
}
