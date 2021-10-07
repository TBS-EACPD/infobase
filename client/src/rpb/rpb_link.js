import _ from "lodash";

import { Gov } from "src/models/subjects";

import { SafeJSURL } from "src/general_utils";

const rpb_link = (naive_state, first_character = "#") =>
  _.chain(naive_state)
    .thru((obj) => {
      const { table, subject, columns } = obj;

      return {
        ...obj,
        table: table && table.is_table ? table.id : table,
        subject: subject && subject.subject_type ? subject.guid : subject,
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
    .thru((obj) => SafeJSURL.stringify(obj))
    .thru(
      (jsurl_representation) => `${first_character}rpb/${jsurl_representation}`
    )
    .value();

const get_appropriate_rpb_subject = (subject) => {
  let appropriate_subject = subject;
  if (_.includes(["program", "crso"], subject.subject_type)) {
    //rpb is useless for the crso/program subject_type
    appropriate_subject = subject.dept;
  } else if (subject.subject_type === "tag") {
    appropriate_subject = Gov;
  }
  return appropriate_subject;
};

export { rpb_link, get_appropriate_rpb_subject };
