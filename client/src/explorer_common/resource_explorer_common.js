import _ from "lodash";
import React from "react";
import { createSelector } from "reselect";

import { TrivialTM as TM, Format } from "src/components/index.js";

import { run_template } from "src/models/text.js";
import { year_templates } from "src/models/years.js";

import { Table } from "src/core/TableClass.js";

const is_planning_year = (year) =>
  _.includes(year_templates.planning_years, year);

const pick_table = (type) =>
  Table.lookup(type === "spending" ? "programSpending" : "programFtes");

const get_rows_for_subject_from_table = _.memoize(
  (subject, type, year) => {
    const table = pick_table(type);
    if (subject.level === "program") {
      const rows_or_record = table.programs.get(subject);
      if (!rows_or_record) {
        return null;
      }
      if (_.isArray(rows_or_record)) {
        return rows_or_record;
      } else {
        return [rows_or_record];
      }
    } else if (
      is_planning_year(year) &&
      _.includes(["dept", "crso"], subject.level)
    ) {
      return table.q(subject).data;
    } else if (!_.isEmpty(subject.programs)) {
      return _.chain(subject.programs)
        .map((prog) => get_rows_for_subject_from_table(prog, type, year))
        .flatten()
        .value();
    } else if (subject.level === "ministry") {
      return _.chain(subject.orgs)
        .map((org) => get_rows_for_subject_from_table(org, type, year))
        .flatten(true)
        .compact()
        .value();
    } else if (!_.isEmpty(subject.children_tags)) {
      return _.chain(subject.children_tags)
        .map((tag) => get_rows_for_subject_from_table(tag, type, year))
        .flatten(true)
        .uniqBy()
        .compact()
        .value();
    } else {
      return null;
    }
  },
  (subject, type, year) => `${subject.guid}-${type}-${year}`
);

const get_resources_for_subject_from_table = (subject, type, year) => {
  const rows = get_rows_for_subject_from_table(subject, type, year);
  const table = pick_table(type);

  const col_suffix =
    !is_planning_year(year) && type === "spending" ? "exp" : "";
  const col = `${year}${col_suffix}`;

  return table.col_from_nick(col).formula(rows);
};

export const get_resources_for_subject = (subject, year) => {
  const spending = get_resources_for_subject_from_table(
    subject,
    "spending",
    year
  );
  const ftes = get_resources_for_subject_from_table(subject, "fte", year);

  if (spending || ftes) {
    return {
      spending,
      ftes,
    };
  } else {
    return null;
  }
};

export const get_col_defs = ({ year }) => [
  {
    id: "name",
    width: 250,
    textAlign: "left",
    header_display: <TM k="name" />,
    get_val: ({ data }) => data.name,
  },
  {
    id: "spending",
    width: 150,
    textAlign: "right",
    header_display: (
      <TM
        k={
          is_planning_year(year)
            ? "planned_spending_header"
            : "actual_spending_header"
        }
        args={{
          year: run_template(year),
        }}
      />
    ),
    get_val: (node) => _.get(node, "data.resources.spending"),
    val_display: (val) =>
      _.isNumber(val) ? <Format type="compact1" content={val} /> : null,
    first_node_m2m_display: (val) =>
      _.isNumber(val) ? (
        <Format
          type="compact1"
          content={val}
          in_parenthesis
          style={{ opacity: 0.5 }}
        />
      ) : null,
  },
  {
    id: "ftes",
    width: 150,
    textAlign: "right",
    header_display: (
      <TM
        k={
          is_planning_year(year) ? "planned_ftes_header" : "actual_ftes_header"
        }
        args={{
          year: run_template(year),
        }}
      />
    ),
    get_val: (node) => _.get(node, "data.resources.ftes"),
    val_display: (val) =>
      _.isNumber(val) ? <Format type="big_int" content={val} /> : null,
    first_node_m2m_display: (val) =>
      _.isNumber(val) ? (
        <Format
          type="big_int"
          content={val}
          in_parenthesis
          style={{ opacity: 0.5 }}
        />
      ) : null,
  },
];

export const create_sort_func_selector = () => {
  const attr_getters = {
    ftes: (node) => _.get(node, "data.resources.ftes") || 0,
    spending: (node) => _.get(node, "data.resources.spending") || 0,
    name: (node) => node.data.name,
  };

  return createSelector(
    [(state) => state.scheme.is_descending, (state) => state.scheme.sort_col],
    (is_descending, sort_col) => {
      const attr_getter = attr_getters[sort_col];

      return (list) => {
        let sorted = _.sortBy(list, attr_getter);
        if (is_descending) {
          sorted = _.reverse(sorted);
        }
        return sorted;
      };
    }
  );
};
