import _ from "lodash";
import mongoose from "mongoose";

import {
  create_resource_by_foreignkey_attr_dataloader,
  create_resource_by_id_attr_dataloader,
} from "../loader_utils.js";
import {
  str_type,
  number_type,
  bilingual,
  pkey_type,
  parent_fkey_type,
  bilingual_str,
} from "../model_utils.js";

import { drr_docs, dp_docs } from "./results_common.js";

export default function (model_singleton) {
  const ResultSchema = mongoose.Schema({
    result_id: pkey_type(),
    stable_id: str_type,
    subject_id: parent_fkey_type(),
    ...bilingual("name", str_type),
    doc: str_type,
  });

  const ResultCountSchema = mongoose.Schema({
    subject_id: parent_fkey_type(),
    level: str_type,

    ..._.chain(drr_docs)
      .flatMap((drr_doc) => [
        [`${drr_doc}_results`, number_type],
        [`${drr_doc}_indicators_met`, number_type],
        [`${drr_doc}_indicators_not_met`, number_type],
        [`${drr_doc}_indicators_not_available`, number_type],
        [`${drr_doc}_indicators_future`, number_type],
      ])
      .fromPairs()
      .value(),

    ..._.chain(dp_docs)
      .flatMap((dp_doc) => [
        [`${dp_doc}_results`, number_type],
        [`${dp_doc}_indicators`, number_type],
      ])
      .fromPairs()
      .value(),
  });

  const IndicatorSchema = mongoose.Schema({
    indicator_id: pkey_type(),
    stable_id: str_type,
    result_id: parent_fkey_type(),
    ...bilingual_str("name"),
    target_year: number_type,
    target_month: number_type,
    ...bilingual_str("target_explanation"),
    ...bilingual_str("result_explanation"),
    doc: str_type,
    ...bilingual_str("actual_result"),
    status_key: str_type,
    ...bilingual_str("methodology"),
    // Want to populate certain indicator fields with their previous year value as available
    // Could use stable_id's to query for this from reducers, but embedding at populate time's much more efficient
    ..._.reduce(
      {
        target_type: str_type,
        target_min: number_type,
        target_max: number_type,
        ...bilingual_str("target_narrative"),
        ...bilingual_str("measure"),
        seeking_to: str_type,
        target_change: str_type,
      },
      (cross_year_target_fields, field_type, field_key) => ({
        ...cross_year_target_fields,
        [field_key]: field_type,
        [`previous_year_${field_key}`]: field_type,
      }),
      {}
    ),
  });

  const PIDRLinkSchema = mongoose.Schema({
    program_id: parent_fkey_type(),
    result_id: parent_fkey_type(),
  });

  model_singleton.define_model("Result", ResultSchema);
  model_singleton.define_model("ResultCount", ResultCountSchema);
  model_singleton.define_model("Indicator", IndicatorSchema);
  model_singleton.define_model("PIDRLink", PIDRLinkSchema);

  const { Result, Indicator, PIDRLink } = model_singleton.models;
  const result_by_subj_loader = create_resource_by_foreignkey_attr_dataloader(
    Result,
    "subject_id"
  );
  const indicator_by_result_loader =
    create_resource_by_foreignkey_attr_dataloader(Indicator, "result_id");
  const program_link_loader = create_resource_by_foreignkey_attr_dataloader(
    PIDRLink,
    "program_id"
  );
  const indicator_id_loader = create_resource_by_id_attr_dataloader(
    Indicator,
    "indicator_id"
  );
  _.each(
    {
      result_by_subj_loader,
      indicator_by_result_loader,
      program_link_loader,
      indicator_id_loader,
    },
    (val, key) => model_singleton.define_loader(key, val)
  );
}
