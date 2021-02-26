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
  vote: number_type,
  stat: number_type,
};
const covid_commitments_fields = {
  fiscal_year: number_type,
  commitment: number_type,
};
const covid_funding_fields = {
  fiscal_year: number_type,
  funding: number_type,
};
const count_fields = {
  fiscal_year: number_type,
  with_authorities: number_type,
  with_spending: number_type,
};

export default function (model_singleton) {
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

    ...covid_commitments_fields,
  });

  const CovidMeasureSchema = mongoose.Schema({
    covid_measure_id: pkey_type(),
    ...bilingual("name", { ...str_type, required: true }),
    in_estimates: { type: Boolean },
    covid_funding: [covid_funding_fields],

    covid_estimates: [CovidEstimatesSchema],
    covid_expenditures: [CovidExpenditureSchema],
    covid_commitments: [CovidCommitmentSchema],
  });

  const common_summary_fields = {
    org_id: pkey_type(),

    covid_estimates: [covid_estimates_fields],
    covid_expenditures: [covid_expenditures_fields],
    covid_commitments: [covid_commitments_fields],
  };
  const CovidOrgSummarySchema = mongoose.Schema({
    ...common_summary_fields,
  });
  const CovidGovSummarySchema = mongoose.Schema({
    ...common_summary_fields,
    covid_funding: [covid_funding_fields],
    spending_sorted_org_ids: [
      {
        fiscal_year: number_type,
        org_ids: [parent_fkey_type()],
      },
    ],
    spending_sorted_measure_ids: [
      {
        fiscal_year: number_type,
        covid_measure_ids: [parent_fkey_type()],
      },
    ],

    measure_counts: [count_fields],
    org_counts: [count_fields],
  });

  const HasCovidDataSchema = mongoose.Schema({
    subject_id: pkey_type(),
    has_estimates: { type: Boolean },
    has_expenditures: { type: Boolean },
    has_commitments: { type: Boolean },
  });

  model_singleton.define_model("CovidMeasure", CovidMeasureSchema);
  model_singleton.define_model("CovidOrgSummary", CovidOrgSummarySchema);
  model_singleton.define_model("CovidGovSummary", CovidGovSummarySchema);
  model_singleton.define_model("HasCovidData", HasCovidDataSchema);

  const {
    HasCovidData,
    CovidMeasure,
    CovidOrgSummary,
    CovidGovSummary,
  } = model_singleton.models;

  const loaders = {
    has_covid_data_loader: create_resource_by_id_attr_dataloader(
      HasCovidData,
      "subject_id"
    ),
    covid_measure_loader: create_resource_by_id_attr_dataloader(
      CovidMeasure,
      "covid_measure_id"
    ),
    covid_measures_by_org_id_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidMeasure,
      "covid_estimates.org_id"
    ),
    covid_org_summary_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidOrgSummary,
      "org_id"
    ),
    covid_gov_summary_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidGovSummary,
      "org_id"
    ),
  };
  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
