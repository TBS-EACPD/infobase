import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/misc_util_components";

import { glossaryEntryStore } from "src/models/glossary";

import { Frequencies } from "./Frequencies";

import text from "./DataSources.yaml";

const { text_maker, TM } = create_text_maker_component(text);

type SourceDef = {
  name: string;
  description: React.ReactNode;
  authoritative_link?: string;
  open_data_link?: string;
  frequency_key?: keyof typeof Frequencies;
};

export type SourceKey =
  | "IGOC"
  | "PA"
  | "ESTIMATES"
  | "CFMRS"
  | "RTP"
  | "DP"
  | "DRR"
  | "RPS"
  | "COVID"
  | "SERVICES";

// HACK WARNING: because the glossaryEntryStore is populated at run time, we can't safely access glossary definitions on-module-load.
// Currently, the glossary stores _will_ allways be populated in time for DataSources to be used though, as long as any sources that
// pull thier definition from the glossary use a getter so that access to the glossary item is lazy-evaluated. Not necessarily future proof
// TODO consider future proof solutions (worst case, duplicate relevant glossary text in DataSources.yaml)
function desc_from_glossary_keys(...glossary_keys: string[]) {
  const definitions = _.map(glossary_keys, (glossary_key) =>
    glossaryEntryStore.lookup(glossary_key).get_compiled_definition()
  );
  return _.map(definitions, (def, ix) => (
    <div key={ix} dangerouslySetInnerHTML={{ __html: def }} />
  ));
}

const source_definitions: { [key in SourceKey]: SourceDef } = {
  IGOC: {
    name: text_maker("igoc_name"),
    description: text_maker("igoc_desc"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  PA: {
    name: text_maker("pa_name"),
    get description() {
      return desc_from_glossary_keys("PA");
    },
    authoritative_link: text_maker("pa_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  ESTIMATES: {
    name: text_maker("estimates_name"),
    get description() {
      return desc_from_glossary_keys("MAINS", "SUPPS");
    },
    authoritative_link: text_maker("estimates_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "quarterly",
  },
  CFMRS: {
    name: text_maker("cfmrs_name"),
    get description() {
      return desc_from_glossary_keys("CFMRS");
    },
    open_data_link: text_maker("cfmrs_open_data_link"),
    frequency_key: "yearly",
  },
  RTP: {
    name: text_maker("rtp_name"),
    description: text_maker("rtp_desc"),
    open_data_link: text_maker("rtp_open_data_link"),
    frequency_key: "yearly",
  },
  DP: {
    name: text_maker("dp_name"),
    get description() {
      return desc_from_glossary_keys("DP");
    },
    authoritative_link: text_maker("dp_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  DRR: {
    name: text_maker("drr_name"),
    get description() {
      return desc_from_glossary_keys("DRR");
    },
    authoritative_link: text_maker("drr_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  RPS: {
    name: text_maker("rps_name"),
    get description() {
      return desc_from_glossary_keys("PEOPLE_DATA");
    },
    frequency_key: "yearly",
    authoritative_link: text_maker("rps_authoritative_link"),
  },
  COVID: {
    name: text_maker("covid_name"),
    description: <TM k="covid_desc" />,
    open_data_link: text_maker("covid_open_data_link"),
    frequency_key: "as_needed",
  },
  SERVICES: {
    name: text_maker("services_name"),
    description: text_maker("services_desc"),
    open_data_link: text_maker("services_open_data_link"),
    frequency_key: "yearly",
  },
};

export const DataSources = _.mapValues(source_definitions, (def: SourceDef) => {
  const { frequency_key } = def;

  const frequency =
    frequency_key !== undefined ? Frequencies[frequency_key] : undefined;

  return { ...def, frequency };
});
