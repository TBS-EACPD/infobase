import * as Subject from '../../models/subject';
import { text_maker } from "../../models/text";


const absolute_value_sort_net_adjust_biased = (a,b) => {
  if (a.data.type === "net_adjust"){
    return Infinity;
  } else if (b.data.type === "net_adjust"){
    return - Infinity;
  } else {
    return - ( Math.abs(a.value) - Math.abs(b.value) );
  }
};

const get_total_budget_measure_funds = (filtered_chapter_keys) => {
  return _.chain( Subject.BudgetMeasure.get_all() )
    .filter( budgetMeasure => _.indexOf(filtered_chapter_keys, budgetMeasure.chapter_key) === -1 )
    .flatMap( budgetMeasure => budgetMeasure.funds )
    .reduce( (sum, fund_row) => sum + (fund_row.fund), 0 )
    .value();
}

const post_traversal_search_string_set = function(node){
  node.data.search_string = "";
  if (node.data.name){
    node.data.search_string += _.deburr(node.data.name.toLowerCase());
  }
  if (node.data.description){
    node.data.search_string += _.deburr(node.data.description.replace(/<(?:.|\n)*?>/gm, '').toLowerCase());
  }
}

const budget_measure_first_hierarchy_factory = (filtered_chapter_keys) => {
  return d3.hierarchy(
    {
      id: "root",
      type: "root", 
      value: get_total_budget_measure_funds(filtered_chapter_keys),
    },
    node => {
      if (node.id === "root"){
        const budgetMeasureNodes = _.chain( Subject.BudgetMeasure.get_all() )
          .filter( budgetMeasure => _.isUndefined(filtered_chapter_keys) ||
            filtered_chapter_keys.length === 0 ||
            _.indexOf(filtered_chapter_keys, budgetMeasure.chapter_key) === -1 
          )
          .map( budgetMeasure => {
            
            const has_no_description = _.isEmpty(budgetMeasure.description);

            return {
              ...budgetMeasure, 
              type: budgetMeasure.id === "net_adjust" ? "net_adjust" : "budget_measure",
              description: has_no_description ?
                    text_maker("not_available") :
                    budgetMeasure.description,
              notes: !has_no_description ? text_maker("budget_measure_description_values_clarification") : false,
              chapter_key: budgetMeasure.chapter_key,
              value: _.reduce(budgetMeasure.funds, (sum, fund_row) => sum + (fund_row.fund), 0),
            }
          })
          .value();
        return budgetMeasureNodes;
      } else if (node.type === "budget_measure"){
        const orgNodes = _.chain(node.funds)
          .filter(fund_row => fund_row.org_id !== "net_adjust")
          .map(fund_row => {
            if (fund_row.org_id === "non_allocated"){
              return {
                name: text_maker("budget_allocation_tbd"),
                description: "", //TODO: get explanation of this case, and use it for item description?
                type: "dept",
                id: 9999,
                value: fund_row.fund,
              };
            } else {
              const dept = Subject.Dept.lookup(fund_row.org_id);
              return  {
                ...dept,
                type: "dept",
                description: dept.mandate,
                value: fund_row.fund,
              };
            }
          })
          .value();
        return orgNodes;
      }
    })
    .eachAfter(node => post_traversal_search_string_set(node) )
    .sort(absolute_value_sort_net_adjust_biased);
}


const dept_first_hierarchy_factory = (filtered_chapter_keys) => {
  const filtered_budget_measure_funds_by_org_id = _.chain( Subject.BudgetMeasure.get_all() )
    .filter( budgetMeasure => _.isUndefined(filtered_chapter_keys) || 
      filtered_chapter_keys.length === 0 ||
      _.indexOf(filtered_chapter_keys, budgetMeasure.chapter_key) === -1 
    )
    .flatMap( budgetMeasure => budgetMeasure.funds )
    .groupBy( fund_row => fund_row.org_id )
    .value();
   
  return d3.hierarchy(
    {
      id: "root",
      type: "root", 
      value: get_total_budget_measure_funds(filtered_chapter_keys),
    },
    node => {
      if (node.id === "root"){
        const deptNodes = _.map(filtered_budget_measure_funds_by_org_id, (fund_rows, org_id) => {
          if (org_id === "non_allocated"){
            return {
              name: text_maker("budget_allocation_tbd"),
              description: "",
              type: "dept",
              id: 9999,
              fund_rows,
            };
          } else if (org_id === "net_adjust"){
            const net_adjust_measure = Subject.BudgetMeasure.lookup("net_adjust");

            return {
              ...net_adjust_measure,
              type: "net_adjust",
              id: 9998,
              value: _.reduce(fund_rows, (sum, fund_row) => sum + fund_row.fund, 0),
            };
          } else {
            const dept = Subject.Dept.lookup(org_id);

            return {
              ...dept,
              type: "dept",
              description: dept.mandate,
              fund_rows,
            };
          }
        });
        return deptNodes;
      } else if (node.type === "dept"){
        const budgetMeasureNodes = _.map(node.fund_rows, fund_row => {
          const budgetMeasure = Subject.BudgetMeasure.lookup(fund_row.measure_id);

          const has_no_description = _.isEmpty(budgetMeasure.description);

          return {
            ...budgetMeasure,
            type: "budget_measure",
            chapter_key: budgetMeasure.chapter_key,
            description: has_no_description ?
                  text_maker("not_available") :
                  budgetMeasure.description,
            notes: !has_no_description ? text_maker("budget_measure_description_values_clarification") : false,
            value: fund_row.fund,
          };
        });
        return budgetMeasureNodes;
      }
    })
    .eachAfter( node => {
      if ( _.isNaN(node.value) && node.children && node.children.length > 0 ){
        node.value = _.reduce(node.children, (sum, child_node) => sum + child_node.value, 0);
      }
      post_traversal_search_string_set(node);
    })
    .sort(absolute_value_sort_net_adjust_biased);
}


export function budget_measures_hierarchy_factory(first_column, filtered_chapter_keys){
  if (first_column === "budget-measure"){
    return budget_measure_first_hierarchy_factory(filtered_chapter_keys);
  } else if (first_column === "dept"){
    return dept_first_hierarchy_factory(filtered_chapter_keys);
  }
}