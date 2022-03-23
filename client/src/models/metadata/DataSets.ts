import _ from "lodash";

import type { PartialOn } from "src/types/util_types";

import { create_text_maker } from "src/models/text";

import { rpb_link } from "src/rpb/rpb_link";

import type { SourceKey } from "./DataSources";
import { DataSources } from "./DataSources";

import text from "./DataSets.yaml";

const text_maker = create_text_maker(text);

type DataSetDef = {
  name: string;
  infobase_link: string;
  source_keys: SourceKey[];
  open_data_link?: string;
};

type DataSetDefs = Record<string, DataSetDef>;

const common_source_data_set_defs = (
  common_sources: SourceKey | SourceKey[],
  partial_defs: Record<string, PartialOn<DataSetDef, "source_keys">>
): DataSetDefs =>
  _.mapValues(
    partial_defs,
    (def): DataSetDef => ({
      ...def,
      source_keys: _.chain(
        _.isArray(common_sources) ? common_sources : [common_sources]
      )
        .concat(def?.source_keys || [])
        .uniq()
        .value(),
    })
  );

//const public_accounts = common_source_data_set_defs("PA", {
//  TODO: { name: "TODO" },
//});
//
//const cfmrs = common_source_data_set_defs("CFMRS", {
//  TODO: { name: "TODO" },
//});
//
//const dp = common_source_data_set_defs("DP", {
//  TODO: { name: "TODO" },
//});
//
//const drr = common_source_data_set_defs("DRR", {
//  TODO: { name: "TODO" },
//});
//
//const people = common_source_data_set_defs("RPS", {
//  TODO: { name: "TODO" },
//});

const covid = common_source_data_set_defs("COVID", {
  covid_auth: {
    name: text_maker("covid_measure_spending_auth"),
    infobase_link:
      "#infographic/gov/gov/covid/.-.-(panel_key.-.-'covid_estimates_panel)",
  },
  covid_exp: {
    name: text_maker("covid_expenditures_estimated_exp"),
    infobase_link:
      "#infographic/gov/gov/covid/.-.-(panel_key.-.-'covid_expenditures_panel)",
  },
});

const misc: DataSetDefs = {
  igoc: {
    name: DataSources.IGOC.name,
    infobase_link: "#igoc",
    source_keys: ["IGOC"],
  },
  tabled_estimates: {
    name: text_maker("tabled_estimates_dataset"),
    infobase_link: rpb_link({
      table: "orgVoteStatEstimates",
    }),
    source_keys: ["ESTIMATES"],
  },
  transfer_payments_by_region: {
    name: DataSources.RTP.name,
    infobase_link: rpb_link({
      table: "orgTransferPaymentsRegion",
    }),
    source_keys: ["RTP"],
  },
  service_inventory: {
    name: DataSources.SERVICES.name,
    infobase_link:
      "#infographic/gov/gov/services/.-.-(panel_key.-.-'services_intro)",
    source_keys: ["SERVICES"],
  },
};

export const DataSets = _.mapValues(
  { ...misc, ...covid },
  (def: DataSetDef) => ({
    ...def,
    sources: _.chain(def.source_keys)
      .map((source_key) => [source_key, DataSources[source_key]])
      .fromPairs()
      .value(),
  })
);
