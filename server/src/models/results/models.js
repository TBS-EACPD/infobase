import _ from 'lodash';
import mongoose from "mongoose";

import { 
  str_type,
  number_type,
  bilingual, 
  pkey_type,
  parent_fkey_type,
  bilingual_str,
} from '../model_utils.js';

import { 
  drr_docs,
  dp_docs,
} from '../constants.js';

import { create_resource_by_foreignkey_attr_dataloader } from '../loader_utils.js';


export default function(model_singleton){

  //"id","subject_id","name_en","name_fr","doc"
  const ResultSchema = mongoose.Schema({
    result_id: pkey_type(),
    stable_id: str_type,
    subject_id: parent_fkey_type(),
    ...bilingual('name', str_type),
    doc: str_type,
  });

  const ResultCountSchema = mongoose.Schema({
    subject_id: parent_fkey_type(),
    level: str_type,

    ..._.chain(drr_docs)
      .flatMap( (drr_doc) => [
        [`${drr_doc}_results`, number_type],
        [`${drr_doc}_indicators_met`, number_type],
        [`${drr_doc}_indicators_not_met`, number_type],
        [`${drr_doc}_indicators_not_available`, number_type],
        [`${drr_doc}_indicators_future`, number_type],
      ])
      .fromPairs()
      .value(),

    ..._.chain(dp_docs)
      .flatMap( (dp_doc) => [
        [`${dp_doc}_results`, number_type],
        [`${dp_doc}_indicators`, number_type],
      ])
      .fromPairs()
      .value(),
  });

  // "id","result_id","name_en","name_fr","target_year","target_month","explanation_en","explanation_fr","target_type","target_min","target_max","target_narrative_en","target_narrative_fr","doc","actual_datatype","actual_result_en","actual_result_fr","status_key","status_period","methodology_en","methodology_fr","measure_en","measure_fr"
  const IndicatorSchema = mongoose.Schema({
    indicator_id: pkey_type(),
    stable_id: str_type,
    result_id: parent_fkey_type(),
    ...bilingual_str("name"),
    target_year: number_type,
    target_month: number_type,
    ...bilingual_str("explanation"),
    // Want to populate certain indicator fields with their previous year value as available
    // Could use stable_id's to query for this from reducers, but embedding at populate time's much more efficient
    ..._.reduce(
      { 
        target_type: str_type,
        target_min: number_type,
        target_max: number_type,
        ...bilingual_str("target_narrative"),
      },
      (cross_year_target_fields, field_type, field_key) => ({
        ...cross_year_target_fields,
        [field_key]: field_type,
        [`previous_year_${field_key}`]: field_type,
      }),
      {},
    ),
    doc: str_type,
    actual_datatype: str_type,
    ...bilingual_str("actual_result"),
    status_key: str_type,
    ...bilingual_str("methodology"),
    ...bilingual_str("measure"),
  });

  //"id","parent_id","name_en","name_fr","description_en","description_fr","planned_spend_pa_last_year","spend_pa_last_year","drr_spend_expl_en","drr_spend_expl_fr","planned_fte_pa_last_year","fte_pa_last_year","drr_fte_expl_en","drr_fte_expl_fr"
  const SubProgramSchema = mongoose.Schema({
    sub_program_id: pkey_type(),
    parent_id: parent_fkey_type(),
    ...bilingual_str("name"),
    ...bilingual_str("description"),
    planned_spend_pa_last_year: { type: Number },
    spend_pa_last_year: { type: Number },
    planned_fte_pa_last_year: { type: Number },
    fte_pa_last_year: { type: Number },
    ...bilingual_str("drr_spend_expl"),
    ...bilingual_str("drr_fte_expl"),
  });

  const PIDRLinkSchema = mongoose.Schema({
    program_id: parent_fkey_type(),
    result_id: parent_fkey_type(),
  });

  model_singleton.define_model("Result", ResultSchema);
  model_singleton.define_model("ResultCount", ResultCountSchema);
  model_singleton.define_model("Indicator", IndicatorSchema);
  model_singleton.define_model("SubProgram", SubProgramSchema);
  model_singleton.define_model("PIDRLink", PIDRLinkSchema);

  const { SubProgram, Result, Indicator, PIDRLink } = model_singleton.models;
  const result_by_subj_loader = create_resource_by_foreignkey_attr_dataloader(Result, 'subject_id');
  const indicator_by_result_loader = create_resource_by_foreignkey_attr_dataloader(Indicator, 'result_id');
  const program_link_loader = create_resource_by_foreignkey_attr_dataloader(PIDRLink, "program_id");
  const sub_program_loader = create_resource_by_foreignkey_attr_dataloader(SubProgram, "parent_id");
  _.each(
    { 
      result_by_subj_loader,
      indicator_by_result_loader,
      program_link_loader,
      sub_program_loader,
    }, 
    (val,key) =>  model_singleton.define_loader(key,val)
  )
}