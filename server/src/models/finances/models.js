import _ from 'lodash';
import mongoose from "mongoose";
import { 
  number_type,
  parent_fkey_type,
} from '../model_utils.js';
import { 
  create_resource_by_foreignkey_attr_dataloader, 
} from '../loader_utils.js';

export default function(model_singleton){
  const ProgramSpendingSchema = mongoose.Schema({
    program_id: parent_fkey_type(),
    pa_last_year_5_exp: number_type,
    pa_last_year_4_exp: number_type,
    pa_last_year_3_exp: number_type,
    pa_last_year_2_exp: number_type,
    pa_last_year_exp: number_type,

    planning_year_1: number_type,
    planning_year_1_rev: number_type,
    planning_year_1_spa: number_type,
    planning_year_1_gross: number_type,

    planning_year_2: number_type,
    planning_year_2_rev: number_type,
    planning_year_2_spa: number_type,
    planning_year_2_gross: number_type,

    planning_year_3: number_type,
    planning_year_3_rev: number_type,
    planning_year_3_spa: number_type,
    planning_year_3_gross: number_type,
  });

  const ProgramFteSchema = mongoose.Schema({
    program_id: parent_fkey_type(),
    pa_last_year_5: number_type,
    pa_last_year_4: number_type,
    pa_last_year_3: number_type,
    pa_last_year_2: number_type,
    pa_last_year: number_type,
    pa_last_year_planned: number_type,

    planning_year_1: number_type,
    planning_year_2: number_type,
    planning_year_3: number_type,
  });


  model_singleton.define_model("ProgramSpending", ProgramSpendingSchema);
  model_singleton.define_model("ProgramFte", ProgramFteSchema);
  const { ProgramSpending, ProgramFte } = model_singleton.models;

  const loaders = {
    program_spending_program_id_loader: create_resource_by_foreignkey_attr_dataloader(ProgramSpending, 'program_id'),
    program_fte_program_id_loader: create_resource_by_foreignkey_attr_dataloader(ProgramFte, 'program_id'),
  };
  _.each( loaders, (val, key) =>  model_singleton.define_loader(key, val) );
}
