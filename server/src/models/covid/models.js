import _ from "lodash";
import mongoose from "mongoose";

import {
  create_resource_by_id_attr_dataloader,
  create_resource_by_foreignkey_attr_dataloader,
} from "../loader_utils.js";
import {
  pkey_type,
  number_type,
  str_type,
  parent_fkey_type,
  bilingual,
} from "../model_utils.js";

export default function (model_singleton) {
  const CovidEstimatesSchema = mongoose.Schema({
    org_id: parent_fkey_type(),

    fiscal_year: number_type,
    est_doc: str_type,
    vote: number_type,
    stat: number_type,
  });

  const CovidMeasureSchema = mongoose.Schema({
    covid_measure_id: pkey_type(),
    ...bilingual("name", { ...str_type, required: true }),

    covid_estimates: [CovidEstimatesSchema],
  });

  model_singleton.define_model("CovidMeasure", CovidMeasureSchema);
  model_singleton.define_model("CovidEstimatesSummary", CovidEstimatesSchema);

  const { CovidMeasure, CovidEstimatesSummary } = model_singleton.models;

  const loaders = {
    covid_measure_loader: create_resource_by_id_attr_dataloader(
      CovidMeasure,
      "measure_id"
    ),
    covid_measures_by_org_id_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidMeasure,
      "estimates.org_id"
    ),
    covid_estimates_summary_by_org_id_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidEstimatesSummary,
      "org_id"
    ),
  };
  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
