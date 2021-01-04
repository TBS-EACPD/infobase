import _ from "src/app_bootstrap/lodash_mixins.js";

import { SafeJSURL } from "../general_utils.js";
import { Subject } from "../models/subject.js";

const rpb_link = (naive_state, first_character = "#") =>
  _.chain(naive_state)
    .pipe((obj) => {
      const { table, subject, columns } = obj;

      return {
        ...obj,
        table: table && table.is_table ? table.id : table,
        subject: subject && subject.level ? subject.guid : subject,
        columns:
          _.first(columns) && _.first(columns).nick
            ? _.map(columns, "nick")
            : columns,
      };
    })
    .pickBy(
      (value, key) =>
        _.includes(
          ["columns", "subject", "dimension", "table", "filter"],
          key
        ) ||
        (key === "broken_url" && value) // need to store broken_url in route state while true so it isn't lost, fine to drop it once it has been cleared (becomes false) to keep the URL clean
    )
    .pipe((obj) => SafeJSURL.stringify(obj))
    .pipe(
      (jsurl_representation) => `${first_character}rpb/${jsurl_representation}`
    )
    .value();

const get_appropriate_rpb_subject = (subject) => {
  let appropriate_subject = subject;
  if (_.includes(["program", "crso"], subject.level)) {
    //rpb is useless at the crso/program level
    appropriate_subject = subject.dept;
  } else if (subject.is("tag")) {
    appropriate_subject = Subject.Gov;
  }
  return appropriate_subject;
};

export { rpb_link, get_appropriate_rpb_subject };
