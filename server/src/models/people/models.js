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
  const OrgPeopleDataSchema = mongoose.Schema({
    org_id: pkey_type(),
    average_age: [
      {
        year: fyear_type(),
        value: number_type,
      },
    ],
    ..._.chain(headcount_types)
      .map((data_type) => [
        data_type,
        [
          {
            dimension: str_type,
            yearly_data: [
              {
                year: fyear_type(),
                value: number_type,
              },
            ],
            avg_share: number_type,
          },
        ],
      ])
      .fromPairs()
      .value(),
  });

  const GovPeopleSummarySchema = mongoose.Schema({
    id: pkey_type(),
    average_age: [
      {
        year: fyear_type(),
        value: number_type,
      },
    ],
    ..._.chain(headcount_types)
      .map((data_type) => [
        data_type,
        [
          {
            dimension: str_type,
            yearly_data: [
              {
                year: fyear_type(),
                value: number_type,
              },
            ],
          },
        ],
      ])
      .fromPairs()
      .value(),
  });

  model_singleton.define_model("OrgPeopleData", OrgPeopleDataSchema);
  model_singleton.define_model("GovPeopleSummary", GovPeopleSummarySchema);

  const { OrgEmployeeSummary, GovPeopleSummary } = model_singleton.models;

  const loaders = {
    org_people_data_loader: create_resource_by_id_attr_dataloader(
      OrgEmployeeSummary,
      "org_id"
    ),
    gov_people_summary_loader: create_resource_by_id_attr_dataloader(
      GovPeopleSummary,
      "id"
    ),
  };

  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
