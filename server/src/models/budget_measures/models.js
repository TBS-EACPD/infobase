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

  // These models are very hierarchical, each being used as an embedded-document in other models up to BudgetMeasureSchema
  // Independant collections will also be populated from each layer of embedded-document. The redundancy is safe becase
  // we'll NEVER update data in-place. The data size trade off's negligible, and it should give room for some efficiency
  // when querying (... or is it actually at odds with using dataloaders? This is a test case for embedded-document-heavy models I guess)

  const BudgetProgramAllocationSchemaObject = {
    subject_id: pkey_type(), // program id or CRSO id
    org_id: parent_fkey_type(), // org id or FakeBudgetOrgSubject id
    measure_id: parent_fkey_type(),

    allocated: {type: Number},
  };
  const BudgetProgramAllocationSubdoc = mongoose.Schema(BudgetProgramAllocationSchemaObject);
  const BudgetProgramAllocationsSchema = mongoose.Schema({
    ...BudgetProgramAllocationSchemaObject,
    subject_id: parent_fkey_type(),
    unique_id: pkey_type(),
  });


  const BudgetSubmeasureSchemaObject = {
    submeasure_id: pkey_type(),
    org_id: parent_fkey_type(), // org id or FakeBudgetOrgSubject id
    parent_measure_id: parent_fkey_type(),
    ...bilingual_str('name'),

    allocated: {type: Number},
    withheld: {type: Number},

    program_allocations: [BudgetProgramAllocationSubdoc],
  };
  const BudgetSubmeasureSubdoc = mongoose.Schema(BudgetSubmeasureSchemaObject);
  const BudgetSubmeasuresSchema= mongoose.Schema({
    ...BudgetSubmeasureSchemaObject,
    submeasure_id: parent_fkey_type(),
    unique_id: pkey_type(),
  });


  const BudgetDataSchemaObject = {
    org_id: pkey_type(), // org id or FakeBudgetOrgSubject id
    measure_id: parent_fkey_type(),
    funding: {type: Number},
    allocated: {type: Number},
    remaining: {type: Number},
    withheld: {type: Number},

    ...bilingual_str('description'),

    program_allocations: [BudgetProgramAllocationSubdoc],

    submeasure_breakouts: [BudgetSubmeasureSubdoc],
  };
  const BudgetDataSubdoc = mongoose.Schema(BudgetDataSchemaObject);
  const BudgetDataSchema = mongoose.Schema({
    ...BudgetDataSchemaObject,
    org_id: parent_fkey_type(),
    unique_id: pkey_type(),
  });


  const BudgetMeasureSchema = mongoose.Schema({
    measure_id: pkey_type(),
    
    budget_year: str_type,
    ...bilingual_str('name'),
    chapter_key: str_type,
    ...bilingual_str('budget_section_id'),
    ...bilingual_str('description'),

    data: [BudgetDataSubdoc],
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
    budget_year => {
      model_singleton.define_model(`Budget${budget_year}Measures`, BudgetMeasureSchema);
      model_singleton.define_model(`Budget${budget_year}Data`, BudgetDataSchema);
      model_singleton.define_model(`Budget${budget_year}ProgramAllocations`, BudgetProgramAllocationsSchema);
      model_singleton.define_model(`Budget${budget_year}Submeasures`, BudgetSubmeasuresSchema);
      model_singleton.define_model(`Budget${budget_year}SubmeasureProgramAllocations`, BudgetProgramAllocationsSchema);
    },
  );
  model_singleton.define_model("FakeBudgetOrgSubject", FakeBudgetOrgSubjectSchema);
  
  // TODO Dataloaders...
  // ... can I do dataloaders by fields in subdocuments? Probably, right?
  // Otherwise, stick an array of org ids on BudgetMeasuresSchema I guess
}