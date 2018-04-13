import * as Subject from '../../models/subject';
import { text_maker } from "../../models/text";


const absolute_value_sort = (a,b) => - ( Math.abs(a.value) - Math.abs(b.value) );

const get_total_budget_measure_funds = (filtered_chapter_keys) => {
  return _.chain( Subject.BudgetMeasure.get_all() )
    .filter( budgetMeasure => _.indexOf(filtered_chapter_keys, budgetMeasure.chapter_key) === -1 )
    .flatMap( budgetMeasure => budgetMeasure.funds )
    .reduce( (sum, fund_row) => sum + (fund_row.fund), 0 )
    .value();
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
          .map( budgetMeasure => _.assign(
            {},
            budgetMeasure, 
            { 
              type: "budget_measure",
              chapter_key: budgetMeasure.chapter_key,
              value: _.reduce(budgetMeasure.funds, (sum, fund_row) => sum + (fund_row.fund), 0),
            }
          ))
          .value();
        return budgetMeasureNodes;
      } else if (node.type === "budget_measure"){
        const orgNodes = _.chain(node.funds)
          .map(fund_row => {
            if (fund_row.org_id === "non_allocated"){
              return _.assign(
                {},
                {
                  name: text_maker("budget_allocation_tbd"),
                  description: "TODO",
                  type: "non_allocated",
                  id: 9999,
                  value: fund_row.fund,
                }
              );
            } else if (fund_row.org_id === "net_adjust"){
              const net_adjust_measure = Subject.BudgetMeasure.lookup("net_adjust");

              return _.assign(
                {},
                {
                  name: net_adjust_measure.name,
                  description: "TODO",
                  type: "net_adjust",
                  id: 9998,
                  value: fund_row.fund,
                }
              );
            } else {
              const dept = Subject.Dept.lookup(fund_row.org_id);
              return _.assign(
                {},
                dept,
                {
                  type: "dept",
                  description: dept.mandate,
                  value: fund_row.fund,
                }
              );
            }
          })
          .value();
        return orgNodes;
      }
    })
    .sort(absolute_value_sort);
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
            return _.assign(
              {},
              { 
                name: text_maker("budget_allocation_tbd"),
                description: "TODO",
                type: "non_allocated",
                id: 9999,
                fund_rows,
              }
            );
          } else if (org_id === "net_adjust"){
            const net_adjust_measure = Subject.BudgetMeasure.lookup("net_adjust");

            return _.assign(
              {},
              { 
                name: net_adjust_measure.name,
                description: "TODO",
                type: "net_adjust",
                id: 9998,
                fund_rows,
              }
            );
          } else {
            const dept = Subject.Dept.lookup(org_id);

            return _.assign(
              {},
              dept,
              { 
                type: "dept",
                description: dept.mandate,
                fund_rows,
              }
            );
          }
        });
        return deptNodes;
      } else if (node.type === "dept" || node.type === "non_allocated" || node.type === "net_adjust"){
        const budgetMeasureNodes = _.map(node.fund_rows, fund_row => {
          const budgetMeasure = Subject.BudgetMeasure.lookup(fund_row.measure_id);
          return _.assign(
            {},
            budgetMeasure,
            { 
              type: "budget_measure",
              chapter_key: budgetMeasure.chapter_key,
              description: budgetMeasure.chapter_key === "oth" ?
                text_maker("other_budget_measure_chapter_description") :
                budgetMeasure.description,
              value: fund_row.fund,
            }
          );
        });
        return budgetMeasureNodes;
      }
    })
    .eachAfter( node => {
      if ( _.isNaN(node.value) && node.children && node.children.length > 0 ){
        node.value = _.reduce(node.children, (sum, child_node) => sum + child_node.value, 0);
      }
    })
    .sort(absolute_value_sort);
}


export function budget_measures_hierarchy_factory(first_column, filtered_chapter_keys){
  if (first_column === "budget-measure"){
    return budget_measure_first_hierarchy_factory(filtered_chapter_keys);
  } else if (first_column === "dept"){
    return dept_first_hierarchy_factory(filtered_chapter_keys);
  }
}