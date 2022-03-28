import _ from "lodash";

// import/order seems to not behave well with `import type ...` lines right now,
// VS code auto fixes to move the util_type import here on save, but the webpack linting complains about it
// TODO there's some import/order + import type related PRs on the package right now, might be fixed soon, keep an eye out
// eslint-disable-next-line import/order
import { InferedKeysRecordHelper } from "src/types/type_utils";
import type { TopicKey } from "src/models/footnotes/footnotes";

import { create_text_maker } from "src/models/text";

import { rpb_link } from "src/rpb/rpb_link";
import type { PartialOn, NonEmpty } from "src/types/util_types.d";

import type { SourceKey } from "./DataSources";
import { DataSources } from "./DataSources";

import text from "./DataSets.yaml";

const text_maker = create_text_maker(text);

type NonEmptySourceKeys = NonEmpty<SourceKey[]>;

type DataSetDef = {
  name: string;
  source_keys: NonEmpty<SourceKey[]>;
  topic_keys: TopicKey[];
  infobase_link: string;
  open_data_link?: string;
};

const common_source_and_topic_data_set_defs = <
  DataSetKey extends string | number | symbol
>(
  common_sources: NonEmptySourceKeys,
  common_topic_keys: TopicKey[],
  partial_defs: Record<
    DataSetKey,
    PartialOn<PartialOn<DataSetDef, "source_keys">, "topic_keys">
  >
) =>
  _.mapValues(
    partial_defs,
    (def): DataSetDef => ({
      ...def,
      topic_keys: _.uniq([...common_topic_keys, ...(def.topic_keys ?? [])]),
      // type inference on NonEmpty isn't ideal, but we can safely assert this as NonEmpty because common_sources is too
      source_keys: _.uniq([
        ...common_sources,
        ...(def.source_keys ?? []),
      ]) as NonEmptySourceKeys,
    })
  );

//const public_accounts = common_source_and_topic_data_set_defs(["PA"], [], {
//  TODO: { name: "TODO" },
//});
//
//const cfmrs = common_source_and_topic_data_set_defs(["CFMRS"], [], {
//  TODO: { name: "TODO" },
//});
//
//const dp = common_source_and_topic_data_set_defs(["DP"], [], {
//  TODO: { name: "TODO" },
//});
//
//const drr = common_source_and_topic_data_set_defs(["DRR"], [], {
//  TODO: { name: "TODO" },
//});

const people = common_source_and_topic_data_set_defs(["RPS"], ["PEOPLE"], {
  age_group: {
    name: text_maker("age_group_dataset"),
    topic_keys: ["AGE", "SUPPRESSED_DATA"],
    infobase_link: rpb_link({
      table: "orgEmployeeAgeGroup",
    }),
    open_data_link: text_maker("age_group_open_data_link"),
  },
  avg_age: {
    name: text_maker("avg_age_dataset"),
    topic_keys: ["AGE"],
    infobase_link: rpb_link({
      table: "orgEmployeeAvgAge",
    }),
    open_data_link: text_maker("avg_age_open_data_link"),
  },
  ex_level: {
    name: text_maker("ex_level_dataset"),
    topic_keys: ["EX_LVL"],
    infobase_link: rpb_link({
      table: "orgEmployeeExLvl",
    }),
    open_data_link: text_maker("ex_level_open_data_link"),
  },
  employee_fol: {
    name: text_maker("employee_fol_dataset"),
    topic_keys: ["FOL", "SUPPRESSED_DATA"],
    infobase_link: rpb_link({
      table: "orgEmployeeFol",
    }),
    open_data_link: text_maker("employee_fol_open_data_link"),
  },
  employee_gender: {
    name: text_maker("employee_gender_dataset"),
    topic_keys: ["GENDER", "SUPPRESSED_DATA"],
    infobase_link: rpb_link({
      table: "orgEmployeeGender",
    }),
    open_data_link: text_maker("employee_gender_open_data_link"),
  },
  employee_region: {
    name: text_maker("employee_region_dataset"),
    topic_keys: ["GEO"],
    infobase_link: rpb_link({
      table: "orgEmployeeRegion",
    }),
    open_data_link: text_maker("employee_region_open_data_link"),
  },
  employee_type: {
    name: text_maker("employee_type_dataset"),
    infobase_link: rpb_link({
      table: "orgEmployeeType",
    }),
    open_data_link: text_maker("employee_type_open_data_link"),
  },
});

const covid = common_source_and_topic_data_set_defs(
  ["COVID"],
  ["COVID", "COVID_MEASURE"],
  {
    covid_auth: {
      name: text_maker("covid_measure_spending_auth"),
      topic_keys: ["COVID_AUTH"],
      infobase_link:
        "#infographic/gov/gov/covid/.-.-(panel_key.-.-'covid_estimates_panel)",
    },
    covid_exp: {
      name: text_maker("covid_expenditures_estimated_exp"),
      topic_keys: ["COVID_EXP"],
      infobase_link:
        "#infographic/gov/gov/covid/.-.-(panel_key.-.-'covid_expenditures_panel)",
    },
    // TODO is covid measures also a "dataset"?
  }
);

const misc = InferedKeysRecordHelper<DataSetDef>()({
  igoc: {
    name: DataSources.IGOC.name,
    source_keys: ["IGOC"],
    topic_keys: [],
    infobase_link: "#igoc",
  },
  // TODO is the program structure also a "dataset"?
  tabled_estimates: {
    name: text_maker("tabled_estimates_dataset"),
    source_keys: ["ESTIMATES"],
    topic_keys: ["AUTH", "EST_PROC", "VOTED", "STAT"],
    infobase_link: rpb_link({
      table: "orgVoteStatEstimates",
    }),
  },
  transfer_payments_by_region: {
    name: DataSources.RTP.name,
    source_keys: ["RTP"],
    topic_keys: ["TP_GEO", "SOBJ10"],
    infobase_link: rpb_link({
      table: "orgTransferPaymentsRegion",
    }),
  },
  service_inventory: {
    name: DataSources.SERVICES.name,
    source_keys: ["SERVICES"],
    topic_keys: ["SERVICES"],
    infobase_link:
      "#infographic/gov/gov/services/.-.-(panel_key.-.-'services_intro)",
  },
});

export const DataSets = _.mapValues(
  _.merge(people, covid, misc),
  (def: DataSetDef) => ({
    ...def,
    sources: _.chain(def.source_keys)
      .map((source_key) => [source_key, DataSources[source_key]])
      .fromPairs()
      .value(),
  })
);
