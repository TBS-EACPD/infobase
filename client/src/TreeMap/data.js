import _ from "src/app_bootstrap/lodash_mixins.js";

import { ensure_loaded } from "../core/lazy_loader.js";
import { Table } from "../core/TableClass.js";

import { Subject } from "../models/subject.js";
import { create_text_maker } from "../models/text.js";

import treemap_text from "./TreeMap.yaml";

const { Dept } = Subject;

const tm = create_text_maker([treemap_text]);
export const smaller_items_text = tm("smaller_items_text");

function has_non_zero_or_non_zero_children(node, perspective = "drf") {
  if (_.isEmpty(node.children)) {
    return perspective === "drf_ftes"
      ? node.ftes && node.ftes != 0
      : Math.abs(node.amount) > 0;
  } else {
    return _.some(node.children, has_non_zero_or_non_zero_children);
  }
}

function header_col(perspective, year) {
  if (!year) {
    year = "pa_last_year";
  } // this should never happen but want to avoid an error in data.js
  if (
    perspective === "drf" ||
    perspective === "tp" ||
    perspective === "vote_stat"
  ) {
    return `{{${year}}}${year.startsWith("pa_") ? "exp" : ""}`; // ignore auth
  } else if (perspective === "ftes" || perspective === "so") {
    return `{{${year}}}`;
  }
  return;
}

function recurse_adjust_size(node, parent_ratio) {
  const new_size = node.size * parent_ratio;
  _.set(node, "size", new_size);
  _.each(node.children, (child) => {
    recurse_adjust_size(child, new_size / node.amount);
  });
}

function group_smallest(
  node_list,
  node_creator,
  should_recurse = true,
  perc_cutoff = 0.02,
  should_adjust_size = true
) {
  if (_.isEmpty(node_list)) {
    return node_list;
  }
  if (should_recurse) {
    //apply recursion first
    _.each(node_list, (child) => {
      child.children = group_smallest(
        child.children,
        node_creator,
        should_recurse,
        perc_cutoff
      );
    });
  }

  const total = _.sumBy(node_list, "size");
  const cutoff = total * perc_cutoff; //TODO: modify cutoff based on screenWidth, mobile should have more nesting for visibility...
  let tiny_nodes = _.filter(node_list, ({ size }) => size < cutoff);

  // we want to avoid making another level to the hierarchy if unnecessary
  if (tiny_nodes.length > 3) {
    const new_node = node_creator(tiny_nodes);

    new_node.amount = _.sumBy(tiny_nodes, "amount");
    new_node.ftes = _.sumBy(tiny_nodes, "ftes");
    new_node.size = _.sumBy(tiny_nodes, "size");
    new_node.is_negative = new_node.amount < 0;

    if (new_node.size < cutoff && should_adjust_size) {
      const old_size = new_node.size;
      _.set(new_node, "size", cutoff);
      _.each(new_node.children, (child) => {
        recurse_adjust_size(child, cutoff / old_size);
      });
    }

    if (should_recurse) {
      //the newly split up children might be able to get grouped again!
      new_node.children = group_smallest(
        tiny_nodes,
        node_creator,
        should_recurse,
        perc_cutoff
      );
    }

    const old_node_list = _.without(node_list, ...tiny_nodes);

    return old_node_list.concat(new_node);
  } else if (tiny_nodes.length > 0 && should_adjust_size) {
    // we want to avoid cases where there are nodes that are too tiny to see
    // e.g. DRF > treasury board > PSIC
    const old_node_list = _.without(node_list, ...tiny_nodes);
    tiny_nodes = _.each(tiny_nodes, function (item) {
      const old_size = item.size;
      _.set(item, "size", cutoff);
      _.each(item.children, (child) => {
        recurse_adjust_size(child, cutoff / old_size);
      });
    });

    return old_node_list.concat(tiny_nodes);
  } else {
    return node_list;
  }
}

function prep_nodes(node, perspective, get_changes) {
  const { children } = node;
  if (!_.isEmpty(children)) {
    _.each(children, (child) => {
      prep_nodes(child, perspective, get_changes);
    });
    if (!node.amount) {
      node.amount = _.sumBy(children, "amount");
    }
    if (!node.ftes) {
      // ok this is terrible but I swear to god nothing I tried that was more concise worked
      node.ftes = _.chain(children)
        .reduce(function (memo, item) {
          if (item.ftes) {
            return memo + item.ftes;
          } else {
            return memo;
          }
        }, 0)
        .value();
    }
    if (get_changes) {
      perspective === "drf_ftes"
        ? (node.size = Math.abs(node.ftes))
        : (node.size = Math.abs(node.amount));
    } else {
      node.size = _.sumBy(children, "size");
    }
    _.each(children, (n) => {
      _.set(n, "parent_amount", node.amount);
      _.set(n, "parent_name", node.name);
      if (node.ftes) {
        _.set(n, "parent_ftes", node.ftes);
      }
    });
  } else {
    //leaf node, already has amount but no size
    if (perspective === "drf_ftes") {
      node.size = Math.abs(node.ftes);
    } else {
      node.size = Math.abs(node.amount);
    }
  }
}

export async function load_data() {
  await ensure_loaded({
    table_keys: [
      "programSpending",
      "programFtes",
      "orgSobjs",
      "orgTransferPayments",
      "orgVoteStatPa",
    ],
  });
}

function spending_change_year_split(year_string) {
  return year_string.split(":");
}

function get_data_drf(
  perspective,
  year,
  year_1,
  year_2,
  filter_var,
  get_changes
) {
  const program_ftes_table = Table.lookup("programFtes");
  const program_spending_table = Table.lookup("programSpending");

  const orgs = _.chain(Dept.get_all())
    .map((org) => ({
      subject: org,
      name: org.name,
      children: _.chain(org.crsos)
        .map((crso) => ({
          subject: crso,
          name: crso.name,
          children: _.chain(crso.programs)
            .map((prog) => {
              return get_changes
                ? {
                    subject: prog,
                    name: prog.name,
                    amount:
                      program_spending_table
                        .q(prog)
                        .sum(header_col("drf", year_2)) -
                      program_spending_table
                        .q(prog)
                        .sum(header_col("drf", year_1)),
                    ftes:
                      program_ftes_table
                        .q(prog)
                        .sum(header_col("ftes", year_2)) -
                      program_ftes_table
                        .q(prog)
                        .sum(header_col("ftes", year_1)),
                  }
                : {
                    subject: prog,
                    name: prog.name,
                    amount: program_spending_table
                      .q(prog)
                      .sum(header_col("drf", year)),
                    ftes:
                      program_ftes_table
                        .q(prog)
                        .sum(header_col("ftes", year)) || 0, // if NA
                  };
            })
            .filter((n) => has_non_zero_or_non_zero_children(n, perspective))
            .value(),
        }))
        .filter((n) => has_non_zero_or_non_zero_children(n, perspective))
        .value(),
    }))
    .filter((n) => has_non_zero_or_non_zero_children(n, perspective))
    .value();
  const data = _.concat(
    _.chain(orgs)
      .filter((o) => {
        return o.subject.ministry;
      })
      .groupBy("subject.ministry.name")
      .toPairs()
      .map(([min_name, orgs]) => ({
        name: min_name,
        children: orgs,
      }))
      .value(),
    _.filter(orgs, (o) => {
      return !o.subject.ministry;
    })
  );
  if (data.length == 0) {
    return data;
  }
  const root = {
    name: "Government",
    children: data,
    amount: _.sumBy(data, "amount"),
  };
  prep_nodes(root, perspective, get_changes);
  root.children = group_smallest(
    root.children,
    (children) => ({ name: smaller_items_text, children }),
    true,
    0.01
  );
  return root;
}

const so_nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 20, 21, 22];

const so_cat = (so) => {
  if (so > 0 && so <= 7) {
    return 1;
  } else if (so > 7 && so <= 9) {
    return 2;
  } else if (so === 21 || so === 22) {
    return 3;
  } else return so;
};

function get_data_so(
  perspective,
  year,
  year_1,
  year_2,
  filter_var,
  get_changes
) {
  const so_nums_to_get = parseInt(filter_var)
    ? _.filter(so_nums, (so) => so_cat(so) === parseInt(filter_var))
    : so_nums;
  const org_sobj_table = Table.lookup("orgSobjs");
  const all_orgs = _.chain(Dept.get_all())
    .map((org) => ({
      subject: org,
      name: org.name,
      children: _.chain(so_nums_to_get)
        .map((so) => ({
          name: tm(`SOBJ${so}`),
          so_num: so,
          amount: _.filter(org_sobj_table.q(org).data, { so_num: so }).length
            ? get_changes
              ? _.chain(org_sobj_table.q(org).data)
                  .filter({ so_num: so })
                  .head()
                  .value()[header_col(perspective, year_2)] -
                _.chain(org_sobj_table.q(org).data)
                  .filter({ so_num: so })
                  .head()
                  .value()[header_col(perspective, year_1)]
              : _.chain(org_sobj_table.q(org).data)
                  .filter({ so_num: so })
                  .head()
                  .value()[header_col(perspective, year)]
            : 0,
        }))
        .filter((n) => has_non_zero_or_non_zero_children(n, perspective))
        .value(),
    }))
    .filter((n) => has_non_zero_or_non_zero_children(n, perspective))
    .value();
  const data = _.concat(
    _.chain(all_orgs)
      .filter((o) => {
        return o.subject.ministry;
      })
      .groupBy("subject.ministry.name")
      .toPairs()
      .map(([min_name, orgs]) => ({
        name: min_name,
        children: orgs,
      }))
      .value(),
    _.filter(all_orgs, (o) => {
      return !o.subject.ministry;
    })
  );
  if (data.length == 0) {
    return data;
  }
  const data_root = {
    name: "Government",
    children: data,
    amount: _.sumBy(data, "amount"),
  };
  prep_nodes(data_root, perspective, get_changes);
  data_root.children = group_smallest(
    data_root.children,
    (children) => ({ name: smaller_items_text, children }),
    true,
    0.01,
    false
  );
  return data_root;
}

function get_data_tp(
  perspective,
  year,
  year_1,
  year_2,
  filter_var,
  get_changes
) {
  const filtering =
    filter_var &&
    filter_var !== "All" &&
    (filter_var === "g" || filter_var === "c");
  const tp_table = Table.lookup("orgTransferPayments");
  const all_orgs = _.chain(Dept.get_all())
    .map((org) => ({
      subject: org,
      name: org.name,
      children: _.chain(tp_table.q(org).data)
        .map((row) => ({
          name: row.tp,
          amount:
            !filtering || row.type_id === filter_var
              ? get_changes
                ? row[header_col(perspective, year_2)] -
                  row[header_col(perspective, year_1)]
                : row[header_col(perspective, year)]
              : 0,
        }))
        .filter(has_non_zero_or_non_zero_children)
        .value(),
    }))
    .filter(has_non_zero_or_non_zero_children)
    .value();
  const data = _.concat(
    _.chain(all_orgs)
      .filter((o) => {
        return o.subject.ministry;
      })
      .groupBy("subject.ministry.name")
      .toPairs()
      .map(([min_name, orgs]) => ({
        name: min_name,
        children: orgs,
      }))
      .value(),
    _.filter(all_orgs, (o) => {
      return !o.subject.ministry;
    })
  );
  if (data.length == 0) {
    return data;
  }
  const root = {
    name: "Government",
    children: data,
    amount: _.sumBy(data, "amount"),
  };
  prep_nodes(root, perspective, get_changes);
  root.children = group_smallest(
    root.children,
    (children) => ({ name: smaller_items_text, children }),
    true,
    0.01
  );
  return root;
}

function get_data_vs(
  perspective,
  year,
  year_1,
  year_2,
  filter_var,
  get_changes
) {
  const vote_stat_table = Table.lookup("orgVoteStatPa");
  const orgs = _.chain(Dept.get_all())
    .map((org) => ({
      subject: org,
      name: org.name,
      children: _.chain(vote_stat_table.q(org).data)
        .groupBy("desc")
        .toPairs()
        .map(([desc, rows]) => ({
          name: desc,
          amount: parseInt(filter_var) // chaining ternary statements, why the heck not???????
            ? get_changes
              ? _.chain(rows)
                  .filter({ votestattype: parseInt(filter_var) })
                  .sumBy(header_col(perspective, year_2))
                  .value() -
                _.chain(rows)
                  .filter({ votestattype: parseInt(filter_var) })
                  .sumBy(header_col(perspective, year_1))
                  .value()
              : _.chain(rows)
                  .filter({ votestattype: parseInt(filter_var) })
                  .sumBy(header_col(perspective, year))
                  .value()
            : get_changes
            ? _.sumBy(rows, header_col(perspective, year_2)) -
              _.sumBy(rows, header_col(perspective, year_1))
            : _.chain(rows).sumBy(header_col(perspective, year)).value(),
        }))
        .filter(has_non_zero_or_non_zero_children)
        .value(),
    }))
    .filter(has_non_zero_or_non_zero_children)
    .value();
  const data = _.concat(
    _.chain(orgs)
      .filter((o) => {
        return o.subject.ministry;
      })
      .groupBy("subject.ministry.name")
      .toPairs()
      .map(([min_name, orgs]) => ({
        name: min_name,
        children: orgs,
      }))
      .value(),
    _.filter(orgs, (o) => {
      return !o.subject.ministry;
    })
  );
  if (data.length == 0) {
    return data;
  }
  const root = {
    name: "Government",
    children: data,
    amount: _.sumBy(data, "amount"),
  };
  prep_nodes(root, perspective, get_changes);
  root.children = group_smallest(
    root.children,
    (children) => ({ name: smaller_items_text, children }),
    true,
    0.01
  );
  return root;
}

export function get_data(perspective, year, filter_var, get_changes) {
  // abandon all hope, ye you enter here
  let data = [],
    year_1,
    year_2;
  // check the year format
  if (
    !year ||
    year === "undefined" ||
    (get_changes && spending_change_year_split(year).length !== 2) ||
    (!get_changes && spending_change_year_split(year).length !== 1)
  ) {
    return data;
  }
  if (get_changes) {
    year_1 = spending_change_year_split(year)[0];
    year_2 = spending_change_year_split(year)[1];
  }

  if (perspective === "drf" || perspective === "drf_ftes") {
    return get_data_drf(
      perspective,
      year,
      year_1,
      year_2,
      filter_var,
      get_changes
    );
  } else if (perspective === "so") {
    return get_data_so(
      perspective,
      year,
      year_1,
      year_2,
      filter_var,
      get_changes
    );
  } else if (perspective === "tp") {
    return get_data_tp(
      perspective,
      year,
      year_1,
      year_2,
      filter_var,
      get_changes
    );
  } else if (perspective === "vote_stat") {
    return get_data_vs(
      perspective,
      year,
      year_1,
      year_2,
      filter_var,
      get_changes
    );
  }
}
