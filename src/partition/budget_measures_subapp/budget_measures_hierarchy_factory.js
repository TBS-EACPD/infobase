import * as Subject from '../../models/subject';

const absolute_value_sort = (a,b) => - ( Math.abs(a.value) - Math.abs(b.value) );

const get_total_budget_measure_allocations = () => {
  return _.chain( Subject.BudgetMeasure.get_all() )
    .flatMap( budgetMeasure => budgetMeasure.allocations )
    .reduce( (sum, allocation_row) => sum + (+allocation_row[2]), 0 )
    .value();
}

const budget_measure_first_hierarchy_factory = () => {
  return d3.hierarchy(
    {
      id: "root",
      type: "root", 
      value: get_total_budget_measure_allocations(),
    },
    node => {
      if (node.id === "root"){
        const budgetMeasureNodes = _.map(Subject.BudgetMeasure.get_all(), 
          budgetMeasure => _.assign(
            {},
            budgetMeasure, 
            { 
              type: "budget_measure",
              value: _.reduce(budgetMeasure.allocations, (sum, allocation_row) => sum + (+allocation_row[2]), 0),
            }
          ));
        return budgetMeasureNodes;
      } else if (node.type === "budget_measure"){
        const orgNodes = _.chain(node.allocations)
          .map(allocation_row => {
            if (allocation_row[1] === "non_allocated"){
              return _.assign(
                {},
                { 
                  name: "TODO: non allocated",
                  description: "TODO",
                  type: "non_allocated",
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



const dept_first_hierarchy_factory = () => {
  const budget_measure_allocations_by_org_id = _.chain( Subject.BudgetMeasure.get_all() )
    .flatMap( budgetMeasure => budgetMeasure.allocations )
    .groupBy( allocation_row => allocation_row[1] )
    .value();
   
  return d3.hierarchy(
    {
      id: "root",
      type: "root", 
      value: get_total_budget_measure_allocations(),
    },
    node => {
      if (node.id === "root"){
        const deptNodes = _.map(budget_measure_allocations_by_org_id, (allocation_rows, org_id) => {
          if (org_id === "non_allocated"){
            return _.assign(
              {},
              { 
                name: "TODO: non allocated",
                description: "TODO",
                type: "non_allocated",
                value: _.reduce(allocation_rows, (sum, allocation_row) => sum + (+allocation_row[2]), 0),
                allocation_rows,
              }
            );
          } else {
            return _.assign(
              {},
              Subject.Dept.lookup(org_id),
              { 
                type: "dept",
                value: _.reduce(allocation_rows, (sum, allocation_row) => sum + (+allocation_row[2]), 0),
                allocation_rows,
              }
            );
          }
        });
        return deptNodes;
      } else if (node.type === "dept" || node.type === "non_allocated"){
        const budgetMeasureNodes = _.map(node.allocation_rows, allocation_row => {
          return _.assign(
            {},
            Subject.BudgetMeasure.lookup(allocation_row[0]),
            { 
              type: "budget_measure",
              value: allocation_row[2],
            }
          );
        });
        return budgetMeasureNodes;
      }
    })
    .sort(absolute_value_sort);
}

export function budget_measures_hierarchy_factory(first_column){
  if (first_column === "budget-measure"){
    return budget_measure_first_hierarchy_factory();
  } else if(first_column === "dept"){
    return dept_first_hierarchy_factory();
  }
}