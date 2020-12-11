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

const covid_estimates_fields = {
  fiscal_year: number_type,
  est_doc: str_type,
  vote: number_type,
  stat: number_type,
};
const covid_expenditures_fields = {
  fiscal_year: number_type,
  is_budgetary: { type: Boolean },
  vote: number_type,
  stat: number_type,
};
const covid_commitments = { fiscal_year: number_type, commitment: number_type };

export default function (model_singleton) {
  const HasCovidDataSchema = mongoose.Schema({
    org_id: pkey_type(),
  });

  const CovidEstimatesSchema = mongoose.Schema({
    org_id: parent_fkey_type(),

    ...covid_estimates_fields,
  });
  const CovidExpenditureSchema = mongoose.Schema({
    org_id: parent_fkey_type(),

    ...covid_expenditures_fields,
  });
  const CovidCommitmentSchema = mongoose.Schema({
    org_id: parent_fkey_type(),

    ...covid_commitments,
  });

  const CovidMeasureSchema = mongoose.Schema({
    covid_measure_id: pkey_type(),
    ...bilingual("name", { ...str_type, required: true }),
    in_estimates: { type: Boolean },

    covid_estimates: [CovidEstimatesSchema],
    covid_expenditures: [CovidExpenditureSchema],
    covid_commitments: [CovidCommitmentSchema],
  });

  const CovidSummarySchema = mongoose.Schema({
    org_id: pkey_type(),

    covid_estimates: [covid_estimates_fields],
    covid_expenditures: [covid_expenditures_fields],
    covid_commitments: [covid_commitments],
  });

  model_singleton.define_model("HasCovidData", HasCovidDataSchema);
  model_singleton.define_model("CovidMeasure", CovidMeasureSchema);
  model_singleton.define_model("CovidSummary", CovidSummarySchema);

  const { HasCovidData, CovidMeasure, CovidSummary } = model_singleton.models;

  const loaders = {
    has_covid_measure_loader: create_resource_by_id_attr_dataloader(
      HasCovidData,
      "org_id"
    ),
    covid_measure_loader: create_resource_by_id_attr_dataloader(
      CovidMeasure,
      "covid_measure_id"
    ),
    covid_measures_by_org_id_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidMeasure,
      "covid_estimates.org_id"
    ),
    covid_summary_by_org_id_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidSummary,
      "org_id"
    ),
  };
  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
