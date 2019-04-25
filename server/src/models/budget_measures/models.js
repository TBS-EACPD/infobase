import _ from "lodash";
import mongoose from "mongoose";

import { budget_years } from './budget_measures_common.js';

import { 
  str_type,
  pkey_type,
  sparse_pkey_type,
  parent_fkey_type,
  bilingual_str,
} from '../model_utils.js';

import {
  create_resource_by_foreignkey_attr_dataloader,
  create_resource_by_id_attr_dataloader,
} from '../loader_utils.js';

export default function(model_singleton){

  const BudgetProgramAllocationSchema = mongoose.Schema({
    unique_id: sparse_pkey_type(), // see note on sparse_pkey_type in ../model_utils.js
    subject_id: parent_fkey_type(), // program id or CRSO id
    org_id: parent_fkey_type(), // org id or FakeBudgetOrgSubject id
    measure_id: parent_fkey_type(),

    allocated: {type: Number},
  });

  const BudgetSubmeasureSchema = mongoose.Schema({
    unique_id: sparse_pkey_type(),
    submeasure_id: parent_fkey_type(),
    org_id: parent_fkey_type(), // org id or FakeBudgetOrgSubject id
    parent_measure_id: parent_fkey_type(),
    ...bilingual_str('name'),

    allocated: {type: Number},
    withheld: {type: Number},

    program_allocations: [BudgetProgramAllocationSchema],
  });

  const BudgetDataSchema = mongoose.Schema({
    unique_id: sparse_pkey_type(),
    org_id: parent_fkey_type(), // org id or FakeBudgetOrgSubject id
    measure_id: parent_fkey_type(),
    funding: {type: Number},
    allocated: {type: Number},
    remaining: {type: Number},
    withheld: {type: Number},

    ...bilingual_str('description'),

    program_allocations: [BudgetProgramAllocationSchema],

    submeasure_breakouts: [BudgetSubmeasureSchema],
  });

  const BudgetMeasureSchema = mongoose.Schema({
    measure_id: pkey_type(),
    
    budget_year: str_type,
    ...bilingual_str('name'),
    chapter_key: str_type,
    ...bilingual_str('section_id'),
    ...bilingual_str('description'),

    data: [BudgetDataSchema],
  });

  // These are artifacts of the Budget 2018 process, shouldn't show up in other years
  const FakeBudgetOrgSubjectSchema = mongoose.Schema({
    org_id: pkey_type(),
    level: str_type,
    ...bilingual_str('name'),
    ...bilingual_str('description'),
  });


  _.each(
    budget_years,
    budget_year => model_singleton.define_model(`Budget${budget_year}Measure`, BudgetMeasureSchema)
  );
  model_singleton.define_model("FakeBudgetOrgSubject", FakeBudgetOrgSubjectSchema);
  
  
  const { FakeBudgetOrgSubject } = model_singleton.models;

  const loaders = {
    fake_budget_org_id_loader: create_resource_by_id_attr_dataloader(FakeBudgetOrgSubject, 'org_id'),
    ..._.chain(budget_years)
      .map(
        budget_year => [
          `budget_${budget_year}_measure_id_loader`,
          create_resource_by_id_attr_dataloader(
            model_singleton.models[`Budget${budget_year}Measure`],
            'measure_id'
          ),
        ]
      )
      .fromPairs()
      .value(),
  };
  _.each( loaders, (val, key) =>  model_singleton.define_loader(key, val) );
}