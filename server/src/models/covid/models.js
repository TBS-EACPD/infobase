import _ from "lodash";
import mongoose from "mongoose";

import { create_resource_by_foreignkey_attr_dataloader } from "../loader_utils.js";
import {
  pkey_type,
  number_type,
  str_type,
  parent_fkey_type,
  bilingual,
} from "../model_utils.js";

export default function (model_singleton) {
  const CovidInitiativeSchema = mongoose.Schema({
    covid_initiative_id: pkey_type(),
    ...bilingual("name", { ...str_type, required: true }),
  });
  const CovidInitiativeEstimatesSchema = mongoose.Schema({
    org_id: parent_fkey_type(),
    covid_initiative_id: parent_fkey_type(),

    fiscal_year: number_type,
    est_doc: str_type,
    vote: number_type,
    stat: number_type,
  });

  model_singleton.define_model("CovidInitiative", CovidInitiativeSchema);
  model_singleton.define_model(
    "CovidInitiativeEstimates",
    CovidInitiativeEstimatesSchema
  );

  const { CovidInitiative, CovidInitiativeEstimates } = model_singleton.models;

  const loaders = {
    CovidInitiative_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidInitiative,
      "covid_initiative_id"
    ),
    CovidInitiativeEstimates_org_id_loader: create_resource_by_foreignkey_attr_dataloader(
      CovidInitiativeEstimates,
      "org_id"
    ),
  };
  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
