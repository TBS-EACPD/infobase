import _ from "lodash";

import type { TopicKey } from "src/models/footnotes/footnotes";

import { create_text_maker } from "src/models/text";

import { rpb_link } from "src/rpb/rpb_link";

import { InferedKeysRecordHelper } from "src/types/type_utils";
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

const public_accounts = common_source_and_topic_data_set_defs(
  ["PA"],
  ["PA", "EXP"],
  {
    org_standard_objects: {
      name: text_maker("org_standard_objects_dataset"),
      topic_keys: ["SOBJ"],
      infobase_link: rpb_link({
        table: "orgSobjs",
      }),
    },
    org_vote_stat: {
      name: text_maker("org_vote_stat_dataset"),
      topic_keys: ["AUTH", "VOTED", "STAT"],
      infobase_link: rpb_link({
        table: "orgVoteStatPa",
      }),
    },
    transfer_payments: {
      name: text_maker("transfer_payments_dataset"),
      topic_keys: ["AUTH", "VOTED", "STAT", "SOBJ10"],
      infobase_link: rpb_link({
        table: "orgTransferPayments",
      }),
    },
  }
);

const cfmrs = common_source_and_topic_data_set_defs(
  ["CFMRS"],
  ["PROG", "PA", "EXP"],
  {
    program_standard_objects: {
      name: text_maker("program_standard_objects_dataset"),
      topic_keys: ["SOBJ", "GOCO"],
      infobase_link: rpb_link({
        table: "programSobjs",
      }),
    },
    program_vote_stat_objects: {
      name: text_maker("program_vote_stat_objects_dataset"),
      topic_keys: ["VOTED", "STAT"],
      infobase_link: rpb_link({
        table: "programVoteStat",
      }),
    },
  }
);

const program_resources = common_source_and_topic_data_set_defs(
  ["DRR", "DP"],
  // PA and PLANNED_EXP don't seem like they should apply to FTEs, but they were already in the programFtes table
  // TODO check actual footnote content, see if FTE footnotes were making use of PA or PLANNED_EXP for some reason
  ["DRR", "DP", "PROG", "GOCO", "PA", "PLANNED_EXP"],
  {
    program_spending: {
      name: text_maker("program_spending_dataset"),
      topic_keys: ["EXP", "AUTH"],
      infobase_link: rpb_link({
        table: "programSpending",
      }),
    },
    program_ftes: {
      name: text_maker("program_ftes_dataset"),
      topic_keys: ["FTE"],
      infobase_link: rpb_link({
        table: "programFtes",
      }),
    },
  }
);

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

const all_data_set_defs = _.merge(
  public_accounts,
  cfmrs,
  program_resources,
  people,
  covid,
  misc
);

export type DataSetKey = keyof typeof all_data_set_defs;

export const DataSets = _.mapValues(
  all_data_set_defs,
  (def: DataSetDef, key) => ({
    ...def,
    key: key as DataSetKey,
    sources: _.map(def.source_keys, (source_key) => DataSources[source_key]),
  })
);
