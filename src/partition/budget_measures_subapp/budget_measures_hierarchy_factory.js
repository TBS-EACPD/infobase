import * as Subject from '../../models/subject';

const absolute_value_sort = (a,b) => - ( Math.abs(a.value) - Math.abs(b.value) );


const budget_measure_first_hierarchy_factory = () => {
  return d3.hierarchy(Subject.gov,
    node => {
      if (node.is("gov")){
        return Subject.BudgetMeasure.get_all();
      } else if ( node.is("budget_measure") ){
        return _.map( node.orgs, org_id => Subject.Dept.lookup(org_id) );
      }
    })
    .eachAfter(node => {
      post_traversal_value_set(node);
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