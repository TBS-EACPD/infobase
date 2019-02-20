import { Table } from '../core/TableClass.js';
import { ensure_loaded } from '../core/lazy_loader.js';
import treemap_text from './TreeMap.yaml';
import { create_text_maker } from '../models/text.js';


const tm = create_text_maker([treemap_text]);
export const smaller_items_text = tm("smaller_items_text");


import { Subject } from '../models/subject.js';

import { create_full_results_hierarchy } from '../gen_expl/result_hierarchies.js';
import { get_root } from '../gen_expl/hierarchy_tools.js';

const { Dept } = Subject;



function has_non_zero_or_non_zero_children(node, perspective = "drf") {
  if (_.isEmpty(node.children)) {
    if (perspective === "drf_ftes") {
      return node.ftes && node.ftes > 0;
    }
    return Math.abs(node.amount) > 0;
  } else {
    return _.some(node.children, has_non_zero_or_non_zero_children);
  }
}


function header_col(perspective, year) {
  if (!year) { year = -1 }; // error, but this should never happen
  if (perspective === "drf" || perspective === "tp") {
    switch (year) {
      case "pa_last_year_5": return "{{pa_last_year_5}}exp";
      case "pa_last_year_4": return "{{pa_last_year_4}}exp";
      case "pa_last_year_3": return "{{pa_last_year_3}}exp";
      case "pa_last_year_2": return "{{pa_last_year_2}}exp";
      case "pa_last_year": return "{{pa_last_year}}exp";
      case "planning_year_1": return "{{planning_year_1}}";
      case "planning_year_2": return "{{planning_year_2}}";
      case "planning_year_3": return "{{planning_year_3}}";
    }
  } else if (perspective === "vote_stat") {
    switch (year) {
      case "pa_last_year_4": return "{{est_last_year_4}}_estimates";
      case "pa_last_year_3": return "{{est_last_year_3}}_estimates";
      case "pa_last_year_2": return "{{est_last_year_2}}_estimates";
      case "pa_last_year": return "{{est_last_year}}_estimates";
      case "planning_year_1": return "{{est_in_year}}_estimates";
      case "planning_year_2": return "{{est_next_year}}_estimates";
    }
  } else if (perspective === "ftes") {
    switch (year) {
      case "pa_last_year_5": return "{{pa_last_year_5}}";
      case "pa_last_year_4": return "{{pa_last_year_4}}";
      case "pa_last_year_3": return "{{pa_last_year_3}}";
      case "pa_last_year_2": return "{{pa_last_year_2}}";
      case "pa_last_year": return "{{pa_last_year}}";
      case "planning_year_1": return "{{planning_year_1}}";
      case "planning_year_2": return "{{planning_year_2}}";
      case "planning_year_3": return "{{planning_year_3}}";
    }
  } else if (perspective === "so") {
    switch (year) {
      case "pa_last_year_3": return "{{pa_last_year_3}}";
      case "pa_last_year_2": return "{{pa_last_year_2}}";
      case "pa_last_year": return "{{pa_last_year}}";
    }
  }
  return;
}




//asumes real_value is set on all nodes
function group_smallest(node_list, node_creator, shouldRecurse = true, perc_cutoff = 0.02, shouldAdjustSize = true) {
  if (_.isEmpty(node_list)) {
    return node_list;
  }
  if (shouldRecurse) {
    //apply recursion first
    _.each(node_list, child => {
      child.children = group_smallest(child.children, node_creator, shouldRecurse, perc_cutoff);
    });
  }

  const total = _.sumBy(node_list, "size");
  const cutoff = (
    //window.is_mobile ? 
    //total*(3/100) : 
    total * perc_cutoff
  ); //TODO: modify cutoff based on screenWidth, mobile should have more nesting for visibility...
  let tiny_nodes = _.filter(node_list, ({ size }) => size < cutoff)

  // we want to avoid making another level to the hierarchy if unnecessary
  if (tiny_nodes.length > 3) {
    const new_node = node_creator(tiny_nodes);

    new_node.amount = _.sumBy(tiny_nodes, "amount")
    new_node.ftes = _.sumBy(tiny_nodes, "ftes")
    new_node.size = _.sumBy(tiny_nodes, "size")
    new_node.is_negative = new_node.amount < 0;

    if (new_node.size < cutoff && shouldAdjustSize) {
      const old_size = new_node.size;
      _.set(new_node, 'size', cutoff);
      _.each(new_node.children, child => { recurse_adjust_size(child, cutoff / old_size) });
    }

    if (shouldRecurse) {
      //the newly split up children might be able to get grouped again!
      new_node.children = group_smallest(tiny_nodes, node_creator, shouldRecurse, perc_cutoff);
    }

    const old_node_list = _.without(node_list, ...tiny_nodes);

    return old_node_list.concat(new_node);
  } else if (tiny_nodes.length > 0 && shouldAdjustSize) {
    // we want to avoid cases where there are nodes that are too tiny to see
    // e.g. DRF > treasury board > PSIC
    const old_node_list = _.without(node_list, ...tiny_nodes);
    tiny_nodes = _.each(tiny_nodes, function (item) {
      const old_size = item.size;
      _.set(item, 'size', cutoff);
      _.each(item.children, child => { recurse_adjust_size(child, cutoff / old_size) });
    });

    return old_node_list.concat(tiny_nodes);
  } else {
    return node_list;
  }
}

function recurse_adjust_size(node, parent_ratio) {
  const new_size = node.size * parent_ratio;
  _.set(node, 'size', new_size);
  _.each(node.children, child => { recurse_adjust_size(child, new_size / node.amount) });
}



function prep_nodes(node, perspective) {
  const { children } = node;
  if (!_.isEmpty(children)) {
    _.each(children, child => { prep_nodes(child, perspective) });
    if (!node.amount) {
      node.amount = _.sumBy(children, "amount");
      node.size = _.sumBy(children, "size");
    }
    if (!node.ftes) {
      // ok this is terrible but I swear to god nothing I tried that was more concise worked
      node.ftes = _.chain(children).reduce(
        function (memo, item) {
          if (item.ftes) {
            return memo + item.ftes;
          } else {
            return memo;
          }
        }, 0).value();
    }
    _.each(children, n => {
      _.set(n, "parent_amount", node.amount);
      _.set(n, "parent_name", node.name);
      if (node.ftes) { _.set(n, "parent_ftes", node.ftes) };
    });
  } else {
    //leaf node, already has amount but no size
    if (perspective === "drf_ftes") {
      node.size = node.ftes;
    } else {
      node.size = Math.abs(node.amount);
    }
  }
  if (node.amount < 0) {
    node.is_negative = true;
  }
}



function result_h7y_mapper(node) {
  const { children, data } = node;
  const { name, type } = data;
  if (_.includes(["result", "indicator"], type)) {
    return null; //will just get filtered out
  } else {
    const amount = _.get(data, "resources.spending");

    const indicators = _.chain(children)
      .filter(child => child.data.type === "result")
      .flatMap(result_node => _.map(result_node.children, "data.indicator"))
      .value();

    const new_children = _.chain(children)
      .map(result_h7y_mapper)
      .compact()
      .value();

    const flat_indicators = indicators.concat(_.flatMap(new_children, "flat_indicators"));

    return {
      amount: amount,
      size: Math.abs(amount),
      children: new_children,

      name,
      resources: data.resources,
      type,
      indicators,
      flat_indicators,
    }
  }

}

function filter_sobj_categories(so_cat, row) {
  if (row.so_num > 0 && row.so_num <= 7) {
    return so_cat === 1;
  } else if (row.so_num > 7 && row.so_num <= 9) {
    return so_cat === 2;
  } else if (row.so_num === 21 || row.so_num === 22) {
    return so_cat === 3;
  }
  return so_cat === row.so_num;
}


export async function load_data() {
  await ensure_loaded({ table_keys: ["programSpending", "programFtes", "programSobjs", "orgTransferPayments", "orgVoteStatEstimates"] });
}


export function get_data(perspective, org_id, year, filter_var) {
  let data;

  if (perspective === "drf" || perspective === "drf_ftes") {
    //await ensure_loaded({ table_keys: ["programSpending", "programFtes"] });
    const program_ftes_table = Table.lookup('programFtes');
    const program_spending_table = Table.lookup('programSpending');

    const orgs = _.chain(Dept.get_all())
      .map(org => ({
        subject: org,
        name: org.fancy_name,
        children: _.chain(org.crsos)
          .map(crso => ({
            subject: crso,
            name: crso.fancy_name,
            children: _.chain(crso.programs)
              .map(prog => ({
                subject: prog,
                name: prog.fancy_name,
                amount: program_spending_table.q(prog).sum(header_col("drf", year)),
                ftes: program_ftes_table.q(prog).sum(header_col("ftes", year)) || 0, // if NA 
              }))
              .filter(n => has_non_zero_or_non_zero_children(n, perspective))
              .value(),
          }))
          .filter(n => has_non_zero_or_non_zero_children(n, perspective))
          .value(),
      }))
      .filter(n => has_non_zero_or_non_zero_children(n, perspective))
      .value();
    data = _.chain(orgs)
      .groupBy('subject.ministry.name')
      .toPairs()
      .map(([min_name, orgs]) => (
        {
          name: min_name,
          children: orgs,
        }
      ))
      .value();
    const root = {
      name: "Government",
      children: data,
      amount: _.sumBy(data, "amount"),
    };
    prep_nodes(root, perspective);
    root.children = group_smallest(
      root.children,
      children => ({ name: smaller_items_text, children }),
      true,
      0.01,
    );
    return root;
  } else if (perspective === "so") {
    //await ensure_loaded({ table_keys: ["programSobjs"] });
    const program_sobj_table = Table.lookup('programSobjs');

    const all_orgs = _.chain(Dept.get_all())
      .map(org => ({
        subject: org,
        name: org.fancy_name,
        children: _.chain(org.crsos)
          .map(crso => ({
            subject: crso,
            name: crso.fancy_name,
            children: _.chain(crso.programs)
              .map(prog => ({
                subject: prog,
                name: prog.fancy_name,
                children: _.chain(program_sobj_table.q(prog).data)
                  .groupBy('so')
                  .toPairs()
                  .map(
                    ([so_name, rows]) => ({
                      name: so_name,
                      amount: parseInt(filter_var) ?
                        _.chain(rows)
                          .filter(row => filter_sobj_categories(parseInt(filter_var), row))
                          .sumBy(header_col(perspective, year))
                          .value() :
                        _.chain(rows)
                          .sumBy(header_col(perspective, year))
                          .value(),
                    }))
                  .filter(n => has_non_zero_or_non_zero_children(n, perspective))
                  .value(),
              }))
              .filter(n => has_non_zero_or_non_zero_children(n, perspective))
              .value(),
          }))
          .filter(n => has_non_zero_or_non_zero_children(n, perspective))
          .value(),
      }))
      .filter(n => has_non_zero_or_non_zero_children(n, perspective))
      .value();
    data = _.chain(all_orgs)
      .groupBy('subject.ministry.name')
      .toPairs()
      .map(([min_name, orgs]) => (
        {
          name: min_name,
          children: orgs,
        }
      ))
      .value();
    const data_root = {
      name: "Government",
      children: data,
      amount: _.sumBy(data, "amount"),
    };
    prep_nodes(data_root, perspective);
    data_root.children = group_smallest(
      data_root.children,
      children => ({ name: smaller_items_text, children }),
      true,
      0.005,
      false
    );
    return data_root;
  } else if (perspective === "tp") {
    //await ensure_loaded({ table_keys: ["orgTransferPayments"] });
    const filtering = filter_var && filter_var !== "All" && (filter_var === "g" || filter_var === "c");
    const tp_table = Table.lookup('orgTransferPayments');
    const all_orgs = _.chain(Dept.get_all())
      .map(org => ({
        subject: org,
        name: org.fancy_name,
        children: _.chain(tp_table.q(org).data)
          .map(row => ({
            name: row.tp,
            amount: (!filtering || row.type_id === filter_var) ? row[header_col(perspective, year)] : 0,
          }))
          .filter(has_non_zero_or_non_zero_children)
          .value(),
      }))
      .filter(has_non_zero_or_non_zero_children)
      .value();
    data = _.chain(all_orgs)
      .groupBy('subject.ministry.name')
      .toPairs()
      .map(([min_name, orgs]) => (
        {
          name: min_name,
          children: orgs,
        }
      ))
      .value();
    const root = {
      name: "Government",
      children: data,
      amount: _.sumBy(data, "amount"),
    };
    prep_nodes(root, perspective);
    root.children = group_smallest(
      root.children,
      children => ({ name: smaller_items_text, children }),
      true,
      0.01
    );
    return root;

  } else if (perspective === "vote_stat") {
    //await ensure_loaded({ table_keys: ["orgVoteStatEstimates"] });
    const vote_stat_table = Table.lookup('orgVoteStatEstimates');
    const orgs = _.chain(Dept.get_all())
      .map(org => ({
        subject: org,
        name: org.fancy_name,
        children: _.chain(vote_stat_table.q(org).data)
          .groupBy('desc')
          .toPairs()
          .map(([desc, rows]) => ({
            name: desc,
            amount: parseInt(filter_var) ?
              _.chain(rows)
                .filter({ votestattype: parseInt(filter_var) })
                .sumBy(header_col(perspective, year))
                .value() :
              _.chain(rows)
                .sumBy(header_col(perspective, year))
                .value(),
          }))
          .filter(has_non_zero_or_non_zero_children)
          .value(),
      }))
      .filter(has_non_zero_or_non_zero_children)
      .value();
    data = _.chain(orgs)
      .groupBy('subject.ministry.name')
      .toPairs()
      .map(([min_name, orgs]) => (
        {
          name: min_name,
          children: orgs,
        }
      ))
      .value();
    const root = {
      name: "Government",
      children: data,
      amount: _.sumBy(data, "amount"),
    };
    prep_nodes(root, perspective);
    root.children = group_smallest(
      root.children,
      children => ({ name: smaller_items_text, children }),
      true,
      0.01,
    );
    return root;
  } else if (perspective === "org_results") {
    // const org = Dept.lookup(org_id || 'ND');
    // await ensure_loaded({
    //   subject: org,
    //   results: true,
    // });

    // const result_hierarchy = create_full_results_hierarchy({
    //   subject_guid: org.guid,
    //   doc: "drr17",
    //   allow_no_result_branches: true,
    // });

    // data = _.map(
    //   get_root(result_hierarchy).children,
    //   result_h7y_mapper
    // );

    // _.each(data, node => { prep_nodes(node, perspective) });
    // const grouped_data = group_smallest(
    //   data,
    //   children => ({ name: smaller_items_text, children })
    // );
    // const root = {
    //   name: org.fancy_name ? org.fancy_name : org.name,
    //   children: grouped_data,
    //   amount: _.sumBy(data, "amount"),
    // };
    // return root;

  }
}