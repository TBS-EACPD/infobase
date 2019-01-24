import { Table } from '../core/TableClass.js';
import { ensure_loaded } from '../core/lazy_loader.js';


export const smaller_items_text = (
  APPLICATION_LANGUAGE === "en" ? 
  "Smaller Items" :
  "Objets plus petits"
)

import { Subject } from '../models/subject.js';
import { 
  by_min_dept, 
  by_dept_type,
  by_this_year_emp,
} from '../dept_explore/data_schemes.js';

import { create_full_results_hierarchy } from '../gen_expl/result_hierarchies.js';
import { get_root } from '../gen_expl/hierarchy_tools.js';

const { Dept } = Subject;

const exp_col = "{{planning_year_1}}";


function has_non_zero_or_non_zero_children(node){
  if(_.isEmpty(node.children)){
    return Math.abs(node.amount) > 0;
  } else {
    return _.some(node.children, has_non_zero_or_non_zero_children);
  }
}



//asumes real_value is set on all nodes
function group_smallest(node_list, node_creator, shouldRecurse=true){
  if(_.isEmpty(node_list)){
    return node_list;
  }
  //apply recursion first
  _.each(node_list, child => {
    child.children = group_smallest(child.children, node_creator);
  });

  const total = _.sumBy(node_list, "size");
  const cutoff = (
    window.is_mobile ? 
    total*(2/100) : 
    total*(0.3/100)
  ); //TODO: modify cutoff based on screenWidth, mobile should have more nesting for visibility...
  const tiny_nodes = _.filter(node_list, ({size}) => size < cutoff )
  let ret;

  if(tiny_nodes.length > 3){
    const new_node = node_creator(tiny_nodes);
    
    //"prep_nodes" equivalent TODO: extract to other func
    new_node.amount = _.sumBy(tiny_nodes,"amount")
    new_node.size = _.sumBy(tiny_nodes,"size")
    new_node.is_negative = new_node.amount < 0;
    
    //the newly split up children might be able to get grouped again!
    new_node.children = group_smallest(tiny_nodes, node_creator);

    const old_node_list = _.without(node_list, ...tiny_nodes);

    return old_node_list.concat(new_node);
  } else {

    return node_list;
  }
}

function prep_nodes(node){
  const { children } = node;
  if(!_.isEmpty(children)){
    _.each(children, prep_nodes);
    node.amount = _.sumBy(children,"amount")
    node.size = _.sumBy(children, "size")
    
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

export async function get_data(type,org_id){
  await ensure_loaded({table_keys: ["table8","table7","table6","table4","table12"]});
  

  let data;
  if(type==="org_results"){
    const org = Dept.lookup(org_id || 'ND');
    await ensure_loaded({
      subject: org,
      results: true,
    });

    const result_hierarchy = create_full_results_hierarchy({
      subject_guid: org.guid,
      doc: "drr16",
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
      name: org.name,
      children: grouped_data,
      amount: _.sumBy(data, "amount")
    };
    return d3.hierarchy(root)
    
  }
  else if(type === "drf"){
    const table12 = Table.lookup('table12');
    const table6 = Table.lookup('table6');
    const orgs = _.chain(Dept.get_all())
      .map(org => ({
        subject: org,
        name: org.name,
        children: _.chain(org.crsos)
          .map(crso => ({
            subject: crso,
            name: crso.name,
            children: _.chain(crso.programs)
              .map(prog => ({
                subject: prog,
                name: prog.name,
                amount: table6.q(prog).sum(exp_col),
              }))
              .filter(has_non_zero_or_non_zero_children)
              .value(),
          }))
          .filter(has_non_zero_or_non_zero_children)
          .value(),
      }))
      .filter(has_non_zero_or_non_zero_children)
      .value();

      data =  _.chain(orgs)
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
  } else if(type === "tp"){
    const table7 = Table.lookup('table7');
    const orgs = _.chain(Dept.get_all())
      .map(org => ({
        subject: org,
        name: org.name,
        children: _.chain(table7.q(org).data)
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

  } else if(type === "vote_stat"){
    const table8 = Table.lookup('table8');
    const orgs = _.chain(Dept.get_all())
      .map(org => ({
        subject: org,
        name: org.name,
        children: _.chain(table8.q(org).data)
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
  }

  _.each(data, prep_nodes);
  const grouped_data = group_smallest(
    data, 
    children => ({ name: smaller_items_text, children })
  );
  const root = {
    name: "Government",
    children: grouped_data,
    amount: _.sumBy(data, "amount")
  };
  return d3.hierarchy(root)
  


}
