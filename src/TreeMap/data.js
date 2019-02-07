import { Table } from '../core/TableClass.js';
import { ensure_loaded } from '../core/lazy_loader.js';
import { trivial_text_maker } from '../models/text.js';

export const smaller_items_text = trivial_text_maker("see_the_infographic");


import { Subject } from '../models/subject.js';

import { create_full_results_hierarchy } from '../gen_expl/result_hierarchies.js';
import { get_root } from '../gen_expl/hierarchy_tools.js';

const { Dept } = Subject;



function has_non_zero_or_non_zero_children(node){
  if(_.isEmpty(node.children)){
    return Math.abs(node.amount) > 0;
  } else {
    return _.some(node.children, has_non_zero_or_non_zero_children);
  }
}

function header_col(type,year){
  if (type === "drf"){
    switch(year) {
      case -5: return "{{pa_last_year_5_exp}}";
      case -4: return "{{pa_last_year_4_exp}}";
      case -3: return "{{pa_last_year_3_exp}}";
      case -2: return "{{pa_last_year_2_exp}}";
      case -1: return "{{pa_last_year_exp}}";
      case 1: return "{{planning_year_1}}";
      case 2: return "{{planning_year_2}}";
      case 3: return "{{planning_year_3}}";
      case 4: return "{{planning_year_4}}";
      case 5: return "{{planning_year_5}}";
    }
  } else if (type === "tp" || type === "vote_stat"){
    switch(year) {
      case -5: return "{{pa_last_year_5_exp}}";
      case -4: return "{{pa_last_year_4_exp}}";
      case -3: return "{{pa_last_year_2_exp}}";
      case -2: return "{{pa_last_year_2_exp}}";
      case -1: return "{{pa_last_year_exp}}";
    }
  } else if (type === "ftes"){
    switch(year) {
      case -5: return "{{pa_last_year_5}}";
      case -4: return "{{pa_last_year_4}}";
      case -3: return "{{pa_last_year_3}}";
      case -2: return "{{pa_last_year_2}}";
      case -1: return "{{pa_last_year}}";
      case 1: return "{{planning_year_1}}";
      case 2: return "{{planning_year_2}}";
      case 3: return "{{planning_year_3}}";
    }
  }
}



//asumes real_value is set on all nodes
function group_smallest(node_list, node_creator, shouldRecurse=true, perc_cutoff=0.02){
  if(_.isEmpty(node_list)){
    return node_list;
  }
  if(shouldRecurse){
    //apply recursion first
    _.each(node_list, child => {
      child.children = group_smallest(child.children, node_creator, shouldRecurse, perc_cutoff);
    });
  }

  const total = _.sumBy(node_list, "size");
  const cutoff = (
    //window.is_mobile ? 
    //total*(3/100) : 
    total*perc_cutoff
  ); //TODO: modify cutoff based on screenWidth, mobile should have more nesting for visibility...
  let tiny_nodes = _.filter(node_list, ({size}) => size < cutoff )

  // we want to avoid making another level to the hierarchy if unnecessary
  if(tiny_nodes.length > 3){
    const new_node = node_creator(tiny_nodes);
    
    //"prep_nodes" equivalent TODO: extract to other func
    new_node.amount = _.sumBy(tiny_nodes,"amount")
    new_node.size = _.sumBy(tiny_nodes,"size")
    new_node.is_negative = new_node.amount < 0;
    
    if (new_node.size < cutoff){
      _.set(new_node, 'size', cutoff);
      _.each(new_node.children, child => {recurse_adjust_size(child,cutoff/new_node.amount)});
    }
    
    if(shouldRecurse){
      //the newly split up children might be able to get grouped again!
      new_node.children = group_smallest(tiny_nodes, node_creator, shouldRecurse, perc_cutoff);
    }

    const old_node_list = _.without(node_list, ...tiny_nodes);

    return old_node_list.concat(new_node);
  } else if(tiny_nodes.length > 0){
    // we want to avoid cases where there are nodes that are too tiny to see
    // e.g. DRF > treasury board > PSIC
    const old_node_list = _.without(node_list, ...tiny_nodes);
    tiny_nodes = _.each(tiny_nodes, function(item){
      _.set(item, 'size', cutoff);
      _.each(item.children, child => {recurse_adjust_size(child,cutoff/item.amount)});
    });

    return old_node_list.concat(tiny_nodes);
  } else {
    return node_list;
  }
}

function recurse_adjust_size(node,parent_ratio){
  const new_size = node.size*parent_ratio;
  _.set(node, 'size', new_size);
  _.each(node.children, child => {recurse_adjust_size(child,new_size/node.amount)});
}



function prep_nodes(node){
  const { children } = node;
  if(!_.isEmpty(children)){
    _.each(children, prep_nodes);
    node.amount = _.sumBy(children,"amount")
    node.size = _.sumBy(children, "size")
    _.each(children, n => { _.set(n, "parent_amount", node.amount)});
    _.each(children, n => { _.set(n, "parent_name", node.name)});
    if(_.chain(children)
      .every()
      .has("ftes")
      .values() ){
      node.ftes = _.sumBy(children, "ftes")
    }
  } else {
    //leaf node, already has amount but no size
    node.size = Math.abs(node.amount);
  }

  if(node.amount < 0 ){
    node.is_negative= true;
  }
}

function result_h7y_mapper(node){
  const { children, data } = node;
  const { name, type } = data;
  if(_.includes(["result","indicator"], type)){
    return null; //will just get filtered out
  } else {
    const amount = _.get(data, "resources.spending");

    const indicators = _.chain(children)
      .filter(child => child.data.type === "result" )
      .flatMap(result_node => _.map(result_node.children, "data.indicator") )
      .value();

    const new_children = _.chain(children)
      .map(result_h7y_mapper)
      .compact()
      .value();

    const flat_indicators = indicators.concat( _.flatMap(new_children, "flat_indicators") );

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

export async function get_data(type, org_id, year){
  await ensure_loaded({table_keys: ["orgVoteStatEstimates","orgTransferPayments","programSpending","programFtes"]});

  let data;

  if(type === "drf"){
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
                amount: program_spending_table.q(prog).sum(header_col(type,year)),
                ftes: program_ftes_table.q(prog).sum("ftes",year),
              }))
              .filter(has_non_zero_or_non_zero_children)
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
      .map( ([min_name, orgs]) => (
          orgs.length > 1 ? 
          {
            name: min_name,
            children: orgs,
          } : 
          _.first(orgs)
      ))
      .value(); 
    const root = {
      name: "Government",
      children: data,
      amount: _.sumBy(data, "amount"),
    };
    prep_nodes(root);
    root.children = group_smallest(
      root.children, 
      children => ({ name: smaller_items_text, children }),
      true,
      0.007,
    );
    return d3.hierarchy(root);
  } else if(type === "tp"){
    const tp_table = Table.lookup('orgTransferPayments');
    const orgs = _.chain(Dept.get_all())
      .map(org => ({
        subject: org,
        name: org.fancy_name,
        children: _.chain(tp_table.q(org).data)
          .map(row => ({
            name: row.tp,
            amount: row["{{pa_last_year}}exp"],
          }))
          .filter(has_non_zero_or_non_zero_children)
          .value(),
      }))
      .filter(has_non_zero_or_non_zero_children)
      .value();
      
    data = orgs;
    const root = {
      name: "Government",
      children: data,
      amount: _.sumBy(data, "amount"),
    };
    prep_nodes(root);
    root.children = group_smallest(
      root.children, 
      children => ({ name: smaller_items_text, children }),
      true,
      0.007
    );
    return d3.hierarchy(root);

  } else if(type === "vote_stat"){
    const vote_stat_table = Table.lookup('orgVoteStatEstimates');
    const orgs = _.chain(Dept.get_all())
      .map(org => ({
        subject: org,
        name: org.fancy_name,
        children: _.chain(vote_stat_table.q(org).data)
          .groupBy('desc')
          .toPairs()
          .map( ([desc, rows]) => ({
            name: desc,
            amount: _.sumBy(rows, "{{est_in_year}}_estimates"),
          }))
          .filter(has_non_zero_or_non_zero_children)
          .value(),
      }))
      .filter(has_non_zero_or_non_zero_children)
      .value();

    
    data = orgs;
    const root = {
      name: "Government",
      children: data,
      amount: _.sumBy(data, "amount"),
    };
    prep_nodes(root);
    root.children = group_smallest(
      root.children, 
      children => ({ name: smaller_items_text, children }),
      true,
      0.005,
    );
    return d3.hierarchy(root);
  }else if(type==="org_results"){
    const org = Dept.lookup(org_id || 'ND');
    await ensure_loaded({
      subject: org,
      results: true,
    });

    const result_hierarchy = create_full_results_hierarchy({
      subject_guid: org.guid,
      doc: "drr17",
      allow_no_result_branches: true,
    });

    data = _.map(
      get_root(result_hierarchy).children,
      result_h7y_mapper
    );  

    _.each(data, prep_nodes);
    const grouped_data = group_smallest(
      data, 
      children => ({ name: smaller_items_text, children })
    );
    const root = {
      name: org.fancy_name? org.fancy_name : org.name,
      children: grouped_data,
      amount: _.sumBy(data, "amount"),
    };
    return d3.hierarchy(root)
    
  }
}