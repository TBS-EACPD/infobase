import './BudgetMeasuresA11yContent.ib.yaml';

import { run_template } from "../../models/text";

import { TextMaker } from '../../util_components.js';

import { budget_measures_hierarchy_factory } from './budget_measures_hierarchy_factory.js';

import * as businessConstants from '../../models/businessConstants.yaml';

const { budget_chapters } = businessConstants;

const year = run_template("{{planning_year_2}}");

export function BudgetMeasuresA11yContent(){
  const hierarchical_budget_measures_data = budget_measures_hierarchy_factory("budget-measure", []);

  return (
    <div>
      <TextMaker text_key="budget_measures_partition_a11y_root" args={{root_value: hierarchical_budget_measures_data.value, year}} /> 
      {"TODO: data table"}
    </div>
  );
}