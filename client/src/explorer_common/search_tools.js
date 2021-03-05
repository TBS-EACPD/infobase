import _ from "lodash";

import { escapeRegExp } from "src/general_utils.js";
import { GlossaryEntry } from "src/models/glossary.js";

function node_to_match_tokens(node) {
  const {
    data: { type, name, subject, table },
  } = node;
  if (type === "indicator") {
    return []; //searching will be done at the results level only.
  }
  if (_.includes(["result", "dr"], type)) {
    return _.chain(node.children)
      .map("data.indicator")
      .map((indicator) => [
        indicator.name,
        indicator.target_explanation,
        indicator.narrative,
        indicator.measure,
      ])
      .flatten()
      .compact()
      .concat([name])
      .value();
  } else if (subject) {
    return _.chain(subject)
      .pick([
        "name",
        "old_name",
        "legal_title",
        "applied_title",
        "dept_code",
        "abbr",
        "description",
        "mandate",
      ])
      .values()
      .compact()
      .value();
  } else if (table) {
    return (
      _.chain(table)
        .pick(["name", "title", "description"])
        .values()
        .concat(
          _.chain(table.tags)
            .map((id) => GlossaryEntry.lookup(id))
            .compact()
            .map("title")
            .value()
        )
        //TODO add in support for searching filter-values i.e. Personnel, Indeterminate, Operating, maybe even stat items
        .compact()
        .value()
    );
  } else {
    return _.chain(node.data)
      .pick(["name", "description"])
      .values()
      .concat(_.chain(node).pick(["name", "description"]).values().value())
      .compact()
      .value();
  }
}

function substr_search_generator(flat_nodes) {
  const search_nodes = flat_nodes.map((node) => ({
    id: node.id,
    text_to_search: node_to_match_tokens(node).join(" "),
  }));

  return (query) => {
    let raw_tokens = query.split(" ");
    let matches_by_id;

    const regexps = raw_tokens.map(
      (str) => new RegExp(escapeRegExp(str), "gi")
    );

    matches_by_id = _.chain(search_nodes)
      .filter(({ text_to_search }) =>
        _.every(regexps, (re) => text_to_search.match(re))
      )
      .map((node) => [node.id, true])
      .fromPairs()
      .value();

    return (node) => matches_by_id[node.id];
  };
}

export { substr_search_generator };
