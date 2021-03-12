import _ from "lodash";
import mongoose from "mongoose";

import {
  create_resource_by_id_attr_dataloader,
  create_resource_by_foreignkey_attr_dataloader,
} from "../loader_utils.js";
import {
  pkey_type,
  parent_fkey_type,
  fyear_type,
  number_type,
  str_type,
  bilingual,
} from "../model_utils.js";

const covid_estimates_fields = {
  est_doc: str_type,
  vote: number_type,
  stat: number_type,
};
const covid_expenditures_fields = {
  vote: number_type,
  stat: number_type,
};
const count_fields = {
  with_authorities: number_type,
  with_spending: number_type,
};

export default function (model_singleton) {
  const HasCovidDataSchema = mongoose.Schema({
    subject_id: parent_fkey_type(),
    fiscal_year: fyear_type(),

    has_estimates: { type: Boolean },
    has_expenditures: { type: Boolean },
  });

  const CovidMeasureSchema = mongoose.Schema({
    covid_measure_id: pkey_type(),
    ...bilingual("name", { ...str_type, required: true }),

    related_org_ids: [parent_fkey_type()],
    covid_data: [
      {
        fiscal_year: fyear_type(),

        covid_estimates: [
          {
            org_id: parent_fkey_type(),

            ...covid_estimates_fields,
          },
        ],
        covid_expenditures: [
          {
            org_id: parent_fkey_type(),

            ...covid_expenditures_fields,
          },
        ],
      },
    ],
  });

  const common_summary_fields = {
    org_id: parent_fkey_type(), // small quirk, used for gov summary and gov summary loader as well, with an org_id of "gov"
    fiscal_year: fyear_type(),

    covid_estimates: [covid_estimates_fields],
    covid_expenditures: covid_expenditures_fields,
  };
  const CovidOrgSummarySchema = mongoose.Schema({
    ...common_summary_fields,
  });
  const CovidGovSummarySchema = mongoose.Schema({
    ...common_summary_fields,

    spending_sorted_org_ids: [parent_fkey_type()],
    spending_sorted_measure_ids: [parent_fkey_type()],

    measure_counts: [count_fields],
    org_counts: [count_fields],
  });

  model_singleton.define_model("HasCovidData", HasCovidDataSchema);
  model_singleton.define_model("CovidMeasure", CovidMeasureSchema);
  model_singleton.define_model("CovidGovSummary", CovidGovSummarySchema);
  model_singleton.define_model("CovidOrgSummary", CovidOrgSummarySchema);

  const {
    CovidMeasure,
    HasCovidData,
    CovidGovSummary,
    CovidOrgSummary,
  } = model_singleton.models;

  const loaders = {
    covid_measure_loader: create_resource_by_id_attr_dataloader(
      CovidMeasure,
      "covid_measure_id"
    ),
    covid_measures_by_related_org_ids_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidMeasure,
      "related_org_ids"
    ),
    has_covid_data_loader: create_resource_by_id_attr_dataloader(
      HasCovidData,
      "subject_id"
    ),
    covid_gov_summary_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidGovSummary,
      "org_id"
    ),
    covid_org_summary_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidOrgSummary,
      "org_id"
    ),
  };
  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
