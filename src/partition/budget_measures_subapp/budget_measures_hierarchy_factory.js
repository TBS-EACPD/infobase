import * as Subject from '../../models/subject';

const absolute_value_sort = (a,b) => - ( Math.abs(a.value) - Math.abs(b.value) );

const get_total_budget_measure_allocations = () => {
  return _.chain( Subject.BudgetMeasure.get_all() )
    .flatMap( budgetMeasure => budgetMeasure.allocations )
    .reduce( (sum, allocation_row) => sum + (+allocation_row[2]), 0)
    .value()
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
          ))
        return budgetMeasureNodes;
      } else if (node.type === "budget_measure"){
        const orgNodes = _.map(node.allocations, allocation_row => {
          return _.assign(
            {},
            Subject.Dept.lookup(allocation_row[1]),
            { 
              type: "dept",
              value: +allocation_row[2],
            }
          )
        });
        return orgNodes;
      }
    })
    .sort(absolute_value_sort);
}

const dept_first_hierarchy_factory = () => {
  
}

export function budget_measures_hierarchy_factory(first_column){
  if (first_column === "budget-measure"){
    return budget_measure_first_hierarchy_factory();
  } else if(first_column === "dept"){
    return dept_first_hierarchy_factory();
  }
}