import _ from "lodash";
import mongoose from "mongoose";

import { create_resource_by_id_attr_dataloader } from "../loader_utils.js";
import {
  pkey_type,
  fyear_type,
  number_type,
  str_type,
} from "../model_utils.js";

import { headcount_types } from "./utils.js";

export default function (model_singleton) {
  const average_age_fragment = {
    year: fyear_type(),
    value: number_type,
  };

  const headcount_data_fragment = {
    dimension: str_type,
    yearly_data: [
      {
        year: fyear_type(),
        value: number_type,
      },
    ],
    avg_share: number_type,
  };

  const OrgPeopleDataSchema = mongoose.Schema({
    org_id: pkey_type(),
    average_age: [{ org_id: { type: String }, ...average_age_fragment }],
    ..._.chain(headcount_types)
      .map((data_type) => [
        data_type,
        [
          {
            org_id: { type: String },
            ...headcount_data_fragment,
            avg_share: number_type,
          },
        ],
      ])
      .fromPairs()
      .value(),
  });

  // TODO expect to add some additional summary stats (e.g. precalculated totals by year) to this model for convienience,
  // but will depend on ultimate client side design/usage
  const GovPeopleSummarySchema = mongoose.Schema({
    id: pkey_type(),
    average_age: [average_age_fragment],
    ..._.chain(headcount_types)
      .map((data_type) => [data_type, [headcount_data_fragment]])
      .fromPairs()
      .value(),
  });

  model_singleton.define_model("OrgPeopleData", OrgPeopleDataSchema);
  model_singleton.define_model("GovPeopleSummary", GovPeopleSummarySchema);

  const { OrgPeopleData, GovPeopleSummary } = model_singleton.models;

  const loaders = {
    org_people_data_loader: create_resource_by_id_attr_dataloader(
      OrgPeopleData,
      "org_id"
    ),
    gov_people_summary_loader: create_resource_by_id_attr_dataloader(
      GovPeopleSummary,
      "id"
    ),
  };

  _.forEach(loaders, (val, key) => model_singleton.define_loader(key, val));
}
