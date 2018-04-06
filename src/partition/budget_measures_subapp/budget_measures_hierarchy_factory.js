import * as Subject from '../../models/subject';

const absolute_value_sort = (a,b) => - ( Math.abs(a.value) - Math.abs(b.value) );

const get_total_budget_measure_allocations = (filtered_chapter_keys) => {
  return _.chain( Subject.BudgetMeasure.get_all() )
    .filter( budgetMeasure => _.indexOf(filtered_chapter_keys, budgetMeasure.chapter_key) === -1 )
    .flatMap( budgetMeasure => budgetMeasure.allocations )
    .reduce( (sum, allocation_row) => sum + (+allocation_row[2]), 0 )
    .value();
}


const budget_measure_first_hierarchy_factory = (filtered_chapter_keys) => {
  return d3.hierarchy(
    {
      id: "root",
      type: "root", 
      value: get_total_budget_measure_allocations(filtered_chapter_keys),
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
              value: _.reduce(budgetMeasure.allocations, (sum, allocation_row) => sum + (+allocation_row[2]), 0),
            }
          ))
          .value();
        return budgetMeasureNodes;
      } else if (node.type === "budget_measure"){
        const orgNodes = _.chain(node.allocations)
          .map(allocation_row => {
            if (allocation_row[1] === "non_allocated"){
              return _.assign(
                {},
                { 
                  name: "TODO: non allocated",
                  mandate: "TODO",
                  type: "non_allocated",
                  id: 9999,
                  value: +allocation_row[2],
                }
              );
            } else {
              return _.assign(
                {},
                Subject.Dept.lookup(allocation_row[1]),
                { 
                  type: "dept",
                  value: +allocation_row[2],
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
  const filtered_budget_measure_allocations_by_org_id = _.chain( Subject.BudgetMeasure.get_all() )
    .filter( budgetMeasure => _.isUndefined(filtered_chapter_keys) || 
      filtered_chapter_keys.length === 0 ||
      _.indexOf(filtered_chapter_keys, budgetMeasure.chapter_key) === -1 
    )
    .flatMap( budgetMeasure => budgetMeasure.allocations )
    .groupBy( allocation_row => allocation_row[1] )
    .value();
   
  return d3.hierarchy(
    {
      id: "root",
      type: "root", 
      value: get_total_budget_measure_allocations(filtered_chapter_keys),
    },
    node => {
      if (node.id === "root"){
        const deptNodes = _.map(filtered_budget_measure_allocations_by_org_id, (allocation_rows, org_id) => {
          if (org_id === "non_allocated"){
            return _.assign(
              {},
              { 
                name: "TODO: non allocated",
                mandate: "TODO",
                type: "non_allocated",
                id: 9999,
                allocation_rows,
              }
            );
          } else {
            return _.assign(
              {},
              Subject.Dept.lookup(org_id),
              { 
                type: "dept",
                allocation_rows,
              }
            );
          }
        });
        return deptNodes;
      } else if (node.type === "dept" || node.type === "non_allocated"){
        const budgetMeasureNodes = _.map(node.allocation_rows, allocation_row => {
          const budgetMeasure = Subject.BudgetMeasure.lookup(allocation_row[0]);
          return _.assign(
            {},
            budgetMeasure,
            { 
              type: "budget_measure",
              chapter_key: budgetMeasure.chapter_key,
              value: +allocation_row[2],
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