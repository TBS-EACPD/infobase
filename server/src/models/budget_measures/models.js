import _ from "lodash";
import mongoose from "mongoose";

import { budget_years } from './budget_measures_common.js';

import { 
  str_type,
  pkey_type,
  parent_fkey_type,
  bilingual_str,
} from '../model_utils.js';

import {
  create_resource_by_foreignkey_attr_dataloader,
  create_resource_by_id_attr_dataloader,
} from '../loader_utils.js';

export default function(model_singleton){

  const BudgetProgramAllocationSchema = mongoose.Schema({
    subject_id: pkey_type(), // program id or CRSO id
    allocated: {type: Number},
  });

  const BudgetSubmeasureSchema = mongoose.Schema({
    submeasure_id: pkey_type(),
    parent_measure_id: parent_fkey_type(),
    ...bilingual_str('name'),

    allocated: {type: Number},
    withheld: {type: Number},

    program_allocations: [BudgetProgramAllocationSchema],
  });

  const BudgetFundsSchema = mongoose.Schema({
    subject_id: pkey_type(), // org id or SpecialFundingSubject id
    funding: {type: Number},
    allocated: {type: Number},
    remaining: {type: Number},
    withheld: {type: Number},

    ...bilingual_str('description'),

    program_allocations: [BudgetProgramAllocationSchema],

    submeasure_breakouts: [BudgetSubmeasureSchema],
  });

  const BudgetMeasuresSchema = mongoose.Schema({
    measure_id: pkey_type(),
    
    budget_year: str_type,
    ...bilingual_str('name'),
    chapter_key: str_type,
    ...bilingual_str('budget_section_id'),
    ...bilingual_str('description'),

    data: [BudgetFundsSchema],
  });


  // These are artifacts of the Budget 2018 process, shouldn't show up in other years
  const SpecialFundingSubjectSchema = mongoose.Schema({
    subject_id: pkey_type(),
    level: str_type,
    ...bilingual_str('name'),
    ...bilingual_str('description'),
  });

  _.each(
    budget_years,
    budget_year => model_singleton.define_model(`Budget${budget_year}Measures`, BudgetMeasuresSchema),
  );
  model_singleton.define_model("SpecialFundingSubject", SpecialFundingSubjectSchema);
  
  // TODO Dataloaders...
  // ... can I do dataloaders by fields in subdocuments? Probably, right?
  // Otherwise, stick an array of org ids on BudgetMeasuresSchema I guess
}