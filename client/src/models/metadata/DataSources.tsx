import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/misc_util_components";

import { services_feature_flag } from "src/core/injected_build_constants";

import { InferedKeysRecordHelper } from "src/types/type_utils";

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

const source_definitions = InferedKeysRecordHelper<SourceDef>()({
  IGOC: {
    name: text_maker("igoc_name"),
    description: <TM k="igoc_desc" />,
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  PA: {
    name: text_maker("pa_name"),
    description: <TM k="igoc_desc" />,
    authoritative_link: text_maker("pa_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  CFMRS: {
    name: text_maker("cfmrs_name"),
    description: <TM k="cfmrs_desc" />,
    open_data_link: text_maker("cfmrs_open_data_link"),
    frequency_key: "yearly",
  },
  RTP: {
    name: text_maker("rtp_name"),
    description: <TM k="rtp_desc" />,
    open_data_link: text_maker("rtp_open_data_link"),
    frequency_key: "yearly",
  },
  ESTIMATES: {
    name: text_maker("estimates_name"),
    description: <TM k="estimates_desc" />,
    authoritative_link: text_maker("estimates_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "quarterly",
  },
  DP: {
    name: text_maker("dp_name"),
    description: <TM k="dp_desc" />,
    authoritative_link: text_maker("dp_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  DRR: {
    name: text_maker("drr_name"),
    description: <TM k="drr_desc" />,
    authoritative_link: text_maker("drr_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  RPS: {
    name: text_maker("rps_name"),
    description: <TM k="rps_desc" />,
    authoritative_link: text_maker("rps_authoritative_link"),
    frequency_key: "yearly",
  },
  COVID: {
    name: text_maker("covid_name"),
    description: <TM k="covid_desc" />,
    open_data_link: text_maker("covid_open_data_link"),
    frequency_key: "as_needed",
  },
  ...(services_feature_flag && {
    SERVICES: {
      name: text_maker("services_name"),
      description: <TM k="services_desc" />,
      open_data_link: text_maker("services_open_data_link"),
      frequency_key: "yearly",
    },
  }),
});

export type SourceKey = keyof typeof source_definitions;

export const DataSources = _.mapValues(
  source_definitions,
  (def: SourceDef, key) => ({
    ...def,
    key: key as SourceKey,
    frequency:
      def.frequency_key !== undefined
        ? Frequencies[def.frequency_key]
        : undefined,
  })
);
