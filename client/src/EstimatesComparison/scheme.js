import { hierarchy } from "d3-hierarchy";
import _ from "lodash";
import React from "react";
import { createSelector } from "reselect";

import { Format } from "src/components/index.js";

import FootNote from "src/models/footnotes/footnotes.js";
import { GlossaryEntry } from "src/models/glossary.js";
import { Subject } from "src/models/subject.js";

import { Table } from "src/core/TableClass.js";

import { AbstractExplorerScheme } from "src/explorer_common/abstract_explorer_scheme.js";
import { convert_d3_hierarchy_to_explorer_hierarchy } from "src/explorer_common/hierarchy_tools.js";
import {
  shallowEqualObjectsOverKeys,
  cached_property,
  bound,
} from "src/general_utils.js";

import EstimatesExplorerComponent from "./EstimatesExplorerComponent.js";
import {
  text_maker,
  TM,
  current_doc_is_mains,
  current_sups_letter,
} from "./utils.js";

const { Dept } = Subject;

const biv_footnote = text_maker("biv_footnote");
const this_year_col = "{{est_in_year}}_estimates";
const last_year_col = "{{est_last_year}}_estimates";
const row_identifier_func = (row) => `${row.dept}-${row.votenum}-${row.desc}`;

const current_doc_code = current_doc_is_mains
  ? "MAINS"
  : `SE${current_sups_letter}`;
const ordered_est_docs = ["MAINS", "VA", "SA", "SEA", "SEB", "SEC"];

function footnote_from_glossary_item(key) {
  return () => GlossaryEntry.lookup(key).definition;
}

const central_vote_footnotes = [
  [5, footnote_from_glossary_item("TB5")],
  [10, footnote_from_glossary_item("TB10")],
  [15, footnote_from_glossary_item("TB15")],
  [25, footnote_from_glossary_item("TB25")],
  [30, footnote_from_glossary_item("TB30")],
  [35, footnote_from_glossary_item("TB35")],
  [40, _.constant(biv_footnote)],
];

function get_footnotes_for_votestat_item({ desc, org_id, votenum }) {
  if (+org_id === 326) {
    const central_vote_footnote = _.find(
      central_vote_footnotes,
      ([num]) => votenum === num
    );
    if (central_vote_footnote) {
      return [
        new FootNote({
          id: "326",
          text: central_vote_footnote[1](),
          subject: Dept.lookup(326),
        }),
      ];
    }
  }
  return;
}

const prior_in_year_doc_filter = (item) =>
  _.chain(ordered_est_docs)
    .takeWhile((est_doc) => est_doc !== current_doc_code)
    .includes(item.est_doc_code)
    .value();
const get_comparision_value = (group) =>
  current_doc_is_mains
    ? _.chain(group)
        .filter((item) => item.est_doc_code === "MAINS")
        .sumBy(last_year_col)
        .value()
    : _.chain(group)
        .filter(prior_in_year_doc_filter)
        .sumBy(this_year_col)
        .value();

const reduce_by_current_doc_dim = (rows) =>
  _.chain(rows)
    .groupBy(row_identifier_func)
    .toPairs()
    .map(([_x, group]) => {
      const [first] = group;
      return {
        dept: first.dept,
        desc: first.desc,
        votenum: first.votenum,
        current_value: _.chain(group)
          .filter({ est_doc_code: current_doc_code })
          .sumBy(this_year_col)
          .value(),
        comparison_value: get_comparision_value(group),
        _rows: group,
      };
    })
    .value();

const get_doc_code_breakdowns = (rows) =>
  _.chain(rows)
    .filter(
      (row) =>
        row.est_doc_code === "MAINS" || row[last_year_col] || row[this_year_col]
    ) //always include mains, even if it's zero
    .groupBy("est_doc_code")
    .toPairs()
    .map(([doc_code, group]) => ({
      doc_code,
      amount_last_year:
        _.some(group, last_year_col) && _.sumBy(group, last_year_col),
      amount_this_year:
        _.some(group, this_year_col) && _.sumBy(group, this_year_col),
    }))
    .value();

const key_for_table_row = (row) => `${row.dept}-${row.votenum}-${row.desc}`;

const get_keys_in_sups = (include_stat) =>
  _.chain(Table.lookup("orgVoteStatEstimates").data)
    .thru(
      include_stat
        ? _.identity
        : (rows) => _.reject(rows, { votestattype: 999 })
    )
    .filter(
      (row) => row[this_year_col] && row.est_doc_code === current_doc_code
    )
    .map((row) => [key_for_table_row(row), 1])
    .fromPairs()
    .value();

const calculate_percent_value = (current_value, comparison_value) => {
  if (current_value && !comparison_value) {
    return Infinity;
  } else {
    if (current_doc_is_mains) {
      return (current_value - comparison_value) / comparison_value;
    } else {
      return current_value / comparison_value;
    }
  }
};

function get_data_by_org(include_stat) {
  const keys_in_sups = get_keys_in_sups(include_stat);

  const data = _.chain(Table.lookup("orgVoteStatEstimates").data)
    .thru(
      include_stat
        ? _.identity
        : (rows) => _.reject(rows, { votestattype: 999 })
    )
    .thru(reduce_by_current_doc_dim)
    .groupBy("dept")
    .toPairs()
    .map(([org_id, rows]) => {
      const org = Dept.lookup(org_id);

      let current_value = 0;
      if (current_doc_is_mains) {
        current_value = _.sumBy(rows, "current_value") || 0;
        if (current_value === 0) {
          return null;
        }
      } else {
        const sups_rows = _.filter(
          rows,
          (row) => keys_in_sups[key_for_table_row(row)]
        );
        if (
          _.isEmpty(sups_rows) ||
          !_.some(sups_rows, (row) => row.current_value || row.comparison_value)
        ) {
          return null;
        }
        current_value = _.sumBy(sups_rows, "current_value") || 0;
      }

      const comparison_value = _.sumBy(rows, "comparison_value") || 0;

      const amounts_by_doc = get_doc_code_breakdowns(_.flatMap(rows, "_rows"));

      return {
        id: org_id,
        data: {
          name: org.name,
          subject: org,
          current_value,
          comparison_value,
          percent_value: calculate_percent_value(
            current_value,
            comparison_value
          ),
          footnotes: FootNote.get_for_subject(org, ["VOTED", "STAT"]),
          amounts_by_doc,
        },
        children: _.chain(rows)
          .map((row) => {
            const current_value = row["current_value"] || 0;
            const comparison_value = row["comparison_value"] || 0;

            if (!current_value && !comparison_value) {
              return null;
            }

            return {
              id: `${org_id}-${row.desc}`,
              data: {
                name: row.desc,
                current_value,
                comparison_value,
                percent_value: calculate_percent_value(
                  current_value,
                  comparison_value
                ),
                footnotes: get_footnotes_for_votestat_item({
                  desc: row.desc,
                  org_id,
                  votenum: row.votenum,
                }),
                amounts_by_doc: get_doc_code_breakdowns(row._rows),
              },
            };
          })
          .compact()
          .value(),
      };
    })
    .compact()
    .value();

  const root = {
    id: "root",
    data: {},
    children: data,
  };

  const d3_h7y = hierarchy(root, _.property("children"));
  return convert_d3_hierarchy_to_explorer_hierarchy(d3_h7y);
}

const strip_stat_marker = (str) =>
  str.indexOf("(S) ") > -1 ? str.split("(S) ")[1] : str;
const get_category_children = (rows) =>
  _.chain(rows)
    .thru(reduce_by_current_doc_dim)
    .map((new_row) => {
      const { votenum, desc, dept } = new_row;
      const current_value = new_row.current_value || 0;
      const comparison_value = new_row.comparison_value || 0;

      if (!current_value && !comparison_value) {
        return null;
      }

      return {
        id: `${dept}-${votenum}-${desc}`,
        data: {
          name: `${Dept.lookup(dept).name} - ${strip_stat_marker(desc)}`,
          comparison_value,
          current_value,
          percent_value: calculate_percent_value(
            current_value,
            comparison_value
          ),
          amounts_by_doc: get_doc_code_breakdowns(new_row._rows),
          footnotes: get_footnotes_for_votestat_item({
            desc,
            org_id: dept,
            votenum,
          }),
        },
      };
    })
    .compact()
    .value();

function get_data_by_item_types() {
  const keys_in_sups = get_keys_in_sups(true);

  const nested_data = _.chain(
    Table.lookup("orgVoteStatEstimates").major_voted_big_stat(
      [this_year_col, last_year_col],
      false,
      false
    )
  )
    .toPairs()
    .map(([category, rows]) => {
      const children = get_category_children(rows, keys_in_sups);

      const current_value = _.sumBy(children, "data.current_value") || 0;
      const comparison_value = get_comparision_value(rows);

      if (current_doc_is_mains) {
        if (current_value === 0) {
          return null;
        }
      } else {
        const sup_rows = _.filter(
          rows,
          (row) => keys_in_sups[key_for_table_row(row)]
        );
        if (_.isEmpty(sup_rows)) {
          return null;
        }
      }

      const is_voted = _.isNumber(_.first(rows).votenum);

      const is_single_item =
        _.chain(rows).map(row_identifier_func).uniq().value().length === 1;
      const name = is_single_item
        ? `${strip_stat_marker(category)} - ${Dept.lookup(rows[0].dept).name}`
        : strip_stat_marker(category);

      return {
        id: category,
        data: {
          name,
          comparison_value,
          current_value,
          percent_value: calculate_percent_value(
            current_value,
            comparison_value
          ),
          amounts_by_doc: get_doc_code_breakdowns(rows),
          is_voted,
        },
        children: is_single_item ? null : children,
      };
    })
    .compact()
    .value();

  const vote_stat = _.chain(nested_data)
    .partition("data.is_voted")
    .map((categories, ix) => {
      const is_voted = ix === 0;

      const current_value = _.sumBy(categories, "data.current_value");
      const comparison_value = _.sumBy(categories, "data.comparison_value");

      if (!current_value && !comparison_value) {
        return null;
      }

      return {
        id: is_voted ? "voted" : "stat",
        children: categories,
        data: {
          name: text_maker(is_voted ? "voted_items" : "stat_items"),
          current_value,
          comparison_value,
          percent_value: calculate_percent_value(
            current_value,
            comparison_value
          ),
        },
        isExpanded: true,
      };
    })
    .value();

  const root = {
    id: "root",
    data: {},
    children: vote_stat,
  };

  const d3_h7y = hierarchy(root, _.property("children"));
  return convert_d3_hierarchy_to_explorer_hierarchy(d3_h7y);
}

const Green = ({ children }) => (
  <span style={{ color: "hsla(120, 100%, 25%, 1)" }}>{children}</span>
);
const Red = ({ children }) => (
  <span style={{ color: "hsla(0, 100%, 40%, 1)" }}>{children}</span>
);
//TODO: it's strange to be storing complex column objects in the redux state, we should probably generate within the component
const get_column_defs = (use_legal_titles) => [
  {
    id: "name",
    width: 250,
    textAlign: "left",
    header_display: <TM k="name" />,
    get_val: ({ data }) =>
      use_legal_titles && _.has(data, "subject.legal_title")
        ? data.subject.legal_title
        : data.name,
  },
  {
    id: "current_value",
    width: 150,
    textAlign: "right",
    header_display: (
      <TM
        k="current_doc_this_year"
        args={{ current_doc_is_mains, current_sups_letter }}
      />
    ),
    get_val: (node) => _.get(node, "data.current_value"),
    val_display: (val) => <Format type="compact2" content={val} />,
  },
  {
    id: "comparison_value_pct",
    width: 150,
    textAlign: "right",
    header_display: current_doc_is_mains ? (
      <TM k="previous_mains_comparison_value" />
    ) : (
      <TM k="change_from_comparison_value" />
    ),
    get_val: (node) => _.get(node, "data.percent_value"),
    val_display: (val) => {
      if (val === Infinity) {
        return (
          <Green>
            <strong>
              <TM k="new" />
            </strong>
          </Green>
        );
      } else {
        const unsigned_percent_display = (
          <Format type="percentage2" content={Math.abs(val)} />
        );

        if (val > 0) {
          return <Green>+{unsigned_percent_display}</Green>;
        } else if (val === 0) {
          return unsigned_percent_display;
        } else {
          return <Red>-{unsigned_percent_display}</Red>;
        }
      }
    },
  },
];

const h7y_layout_options = ["org", "item_type"];
const use_legal_titles_default = false;

export class EstimatesExplorer extends AbstractExplorerScheme {
  Component = EstimatesExplorerComponent;

  constructor(intitial_h7y_layout) {
    super();
    this.initial_scheme_state = {
      doc_code: current_doc_code,
      sort_col: "current_value",
      is_descending: true,
      show_stat: true,
      use_legal_titles: use_legal_titles_default,
      column_defs: get_column_defs(use_legal_titles_default),
      h7y_layout: _.includes(h7y_layout_options, intitial_h7y_layout)
        ? intitial_h7y_layout
        : h7y_layout_options[0],
    };
  }

  scheme_reducer = (state = {}, action) => {
    const { type, payload } = action;

    if (type === "set_h7y_layout") {
      //this should always reset the show_stat filter
      if (payload === state.h7y_layout) {
        //if no change, state don't change
        return state;
      }
      return {
        ...state,
        show_stat: true,
        h7y_layout: payload,
      };
    }
    if (type === "toggle_stat_filter") {
      return {
        ...state,
        show_stat: !state.show_stat,
      };
    }
    if (type === "toggle_legal_titles") {
      return {
        ...state,
        use_legal_titles: !state.use_legal_titles,
        column_defs: get_column_defs(!state.use_legal_titles),
      };
    }
    if (type === "column_header_click") {
      const { is_descending, sort_col } = state;
      const clicked_col = payload;
      const mods =
        clicked_col === sort_col
          ? { is_descending: !is_descending }
          : { is_descending: true, sort_col: clicked_col };
      return { ...state, ...mods };
    } else {
      return state;
    }
  };

  set_h7y_layout(layout_key) {
    this.get_store().dispatch({ type: "set_h7y_layout", payload: layout_key });
  }

  @bound
  map_state_to_props(state) {
    return {
      ...super.map_state_to_props(state),
      ...state.scheme,
    };
  }

  @bound
  map_dispatch_to_props(dispatch) {
    const col_click = (col_key) =>
      dispatch({ type: "column_header_click", payload: col_key });
    const toggle_stat_filter = () => dispatch({ type: "toggle_stat_filter" });
    const toggle_legal_titles = () => dispatch({ type: "toggle_legal_titles" });

    return {
      ...super.map_dispatch_to_props(dispatch),
      col_click,
      toggle_legal_titles,
      toggle_stat_filter,
    };
  }

  should_regenerate_hierarchy(old_state, new_state) {
    return !shallowEqualObjectsOverKeys(old_state.scheme, new_state.scheme, [
      "show_stat",
      "h7y_layout",
    ]);
  }

  @cached_property
  get_base_hierarchy_selector() {
    return createSelector(
      (state) => state.scheme.show_stat,
      (state) => state.scheme.h7y_layout,
      (should_show_stat, h7y_layout) => {
        if (h7y_layout === "item_type") {
          return get_data_by_item_types();
        } else {
          return get_data_by_org(should_show_stat);
        }
      }
    );
  }

  @cached_property
  get_sort_func_selector() {
    return createSelector(
      [
        (state) => state.scheme.is_descending,
        (state) => state.scheme.sort_col,
        (state) => state.scheme.column_defs,
      ],
      (is_descending, sort_col, column_defs) => {
        const attr_getter = _.find(column_defs, { id: sort_col }).get_val;

        return (list) => {
          let sorted = _.sortBy(list, attr_getter);
          if (is_descending) {
            sorted = _.reverse(sorted);
          }
          return sorted;
        };
      }
    );
  }
}
