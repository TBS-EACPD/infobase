import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/misc_util_components";

import { glossaryEntryStore } from "src/models/glossary";

import { lang } from "src/core/injected_build_constants";

import { Frequencies } from "./Frequencies";

import text from "./DataSources.yaml";

const { text_maker, TM } = create_text_maker_component(text);

type SourceDef = {
  name: string;
  description: React.ReactNode;
  definitive_link?: string;
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

const infobase_open_data_href = {
  en: "http://open.canada.ca/data/en/dataset/a35cf382-690c-4221-a971-cf0fd189a46f",
  fr: "https://ouvert.canada.ca/data/fr/dataset/a35cf382-690c-4221-a971-cf0fd189a46f",
}[lang];

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
    open_data_link: infobase_open_data_href,
    frequency_key: "yearly",
  },
  PA: {
    name: text_maker("pa_name"),
    get description() {
      return desc_from_glossary_keys("PA");
    },
    definitive_link: {
      en: "https://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/apropos-about-eng.html",
      fr: "https://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/apropos-about-fra.html",
    }[lang],
    open_data_link: infobase_open_data_href,
    frequency_key: "yearly",
  },
  ESTIMATES: {
    name: text_maker("estimates_name"),
    get description() {
      return desc_from_glossary_keys("MAINS", "SUPPS");
    },
    definitive_link: {
      en: "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/government-expenditure-plan-main-estimates.html",
      fr: "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/plan-depenses-budget-principal.html",
    }[lang],
    open_data_link: infobase_open_data_href,
    frequency_key: "quarterly",
  },
  CFMRS: {
    name: text_maker("cfmrs_name"),
    get description() {
      return desc_from_glossary_keys("CFMRS");
    },
    open_data_link: {
      en: "http://open.canada.ca/data/en/dataset/5e6dcf6b-dbed-4b51-84e5-1f4926ad7fdf",
      fr: "http://ouvert.canada.ca/data/fr/dataset/5e6dcf6b-dbed-4b51-84e5-1f4926ad7fdf",
    }[lang],
    frequency_key: "yearly",
  },
  RTP: {
    name: text_maker("rtp_name"),
    description: text_maker("rtp_desc"),
    open_data_link: {
      en: "https://open.canada.ca/data/en/dataset/69bdc3eb-e919-4854-bc52-a435a3e19092",
      fr: "https://ouvert.canada.ca/data/fr/dataset/69bdc3eb-e919-4854-bc52-a435a3e19092",
    }[lang],
    frequency_key: "yearly",
  },
  DP: {
    name: text_maker("dp_name"),
    get description() {
      return desc_from_glossary_keys("DP");
    },
    definitive_link: {
      en: "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/reports-plans-priorities.html",
      fr: "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/rapports-plans-priorites.html",
    }[lang],
    open_data_link: infobase_open_data_href,
    frequency_key: "yearly",
  },
  DRR: {
    name: text_maker("drr_name"),
    get description() {
      return desc_from_glossary_keys("DRR");
    },
    definitive_link: {
      en: "https://www.canada.ca/en/treasury-board-secretariat/services/departmental-performance-reports.html",
      fr: "https://www.canada.ca/fr/secretariat-conseil-tresor/services/rapports-ministeriels-rendement.html",
    }[lang],
    open_data_link: infobase_open_data_href,
    frequency_key: "yearly",
  },
  RPS: {
    name: text_maker("rps_name"),
    get description() {
      return desc_from_glossary_keys("PEOPLE_DATA");
    },
    frequency_key: "yearly",
    definitive_link: {
      en: "https://www.canada.ca/en/treasury-board-secretariat/services/innovation/human-resources-statistics.html",
      fr: "https://www.canada.ca/fr/secretariat-conseil-tresor/services/innovation/statistiques-ressources-humaines.html",
    }[lang],
  },
  COVID: {
    name: text_maker("covid_name"),
    description: <TM k="covid_desc" />,
    open_data_link: {
      en: "https://open.canada.ca/data/en/dataset/9fa1da9a-8c0f-493e-b207-0cc95889823e",
      fr: "https://ouvert.canada.ca/data/fr/dataset/9fa1da9a-8c0f-493e-b207-0cc95889823e",
    }[lang],
    frequency_key: "as_needed",
  },
  SERVICES: {
    name: text_maker("services_name"),
    description: text_maker("services_desc"),
    open_data_link: {
      en: "https://open.canada.ca/data/en/dataset/3ac0d080-6149-499a-8b06-7ce5f00ec56c",
      fr: "https://ouvert.canada.ca/data/fr/dataset/3ac0d080-6149-499a-8b06-7ce5f00ec56c",
    }[lang],
    frequency_key: "yearly",
  },
};

export const DataSources = _.mapValues(source_definitions, (def: SourceDef) => {
  const { frequency_key } = def;

  const frequency =
    frequency_key !== undefined ? Frequencies[frequency_key] : undefined;

  return { ...def, frequency };
});
