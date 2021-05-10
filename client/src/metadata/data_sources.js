import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/misc_util_components.js";

import { GlossaryEntry } from "src/models/glossary.js";

import {
  lang,
  services_feature_flag,
} from "src/core/injected_build_constants.ts";

//circular dependency hack..
import { Table } from "src/core/TableClass.js";

import { rpb_link } from "src/rpb/rpb_link.js";

import data_source_text from "./data_sources.yaml";
import freq_text from "./frequencies.yaml";

const { text_maker, TM } = create_text_maker_component([
  data_source_text,
  freq_text,
]);

// BIG HACK WARNING on desc_from_glossary_keys and tables_from_source_key, due to a circular dependency and sloppy timing,
// neither can be used on-module-load. Any source declarations using these functions need to call them inside getters
// to defer calls to Table and GlossaryEntry until after both are populated
// TODO sort the general mess of this code out

function desc_from_glossary_keys(...glossary_keys) {
  const definitions = _.map(
    glossary_keys,
    (glossary_key) => GlossaryEntry.lookup(glossary_key).definition
  );
  return _.map(definitions, (def, ix) => (
    <div key={ix} dangerouslySetInnerHTML={{ __html: def }} />
  ));
}

function tables_from_source_key(source_key) {
  return _.filter(Table.get_all(), (table) =>
    _.includes(table.source, source_key)
  );
}

function table_to_row_item(table) {
  return {
    key: table.id,
    text: table.name,
    inline_link:
      !table.no_link &&
      rpb_link({
        table: table.id,
        mode: "details",
      }),
    external_link: table.link[lang],
  };
}

const infobase_open_data_page = {
  en:
    "http://open.canada.ca/data/en/dataset/a35cf382-690c-4221-a971-cf0fd189a46f",
  fr:
    "https://ouvert.canada.ca/data/fr/dataset/a35cf382-690c-4221-a971-cf0fd189a46f",
};

const sources = _.chain([
  {
    key: "PA",
    title: text_maker("pa_title"),
    frequency: text_maker("yearly"),
    open_data: infobase_open_data_page,
    report_link: {
      en: "http://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/index-eng.html",
      fr: "http://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/index-fra.html",
    },
    get description() {
      return desc_from_glossary_keys("PA");
    },
    get items() {
      return _.map(tables_from_source_key("PA"), table_to_row_item);
    },
  },
  {
    key: "ESTIMATES",
    title: text_maker("estimates_title"),
    frequency: text_maker("quarterly"),
    open_data: infobase_open_data_page,
    report_link: {
      en:
        "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/government-expenditure-plan-main-estimates.html",
      fr:
        "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/plan-depenses-budget-principal.html",
    },
    get description() {
      return desc_from_glossary_keys("MAINS", "SUPPS");
    },
    get items() {
      return _.map(tables_from_source_key("ESTIMATES"), table_to_row_item);
    },
  },
  {
    key: "CFMRS",
    title: text_maker("cfmrs_title"),
    open_data: {
      en:
        "http://open.canada.ca/data/en/dataset/5e6dcf6b-dbed-4b51-84e5-1f4926ad7fdf",
      fr:
        "http://ouvert.canada.ca/data/fr/dataset/5e6dcf6b-dbed-4b51-84e5-1f4926ad7fdf",
    },
    frequency: text_maker("yearly"),
    get description() {
      return desc_from_glossary_keys("CFMRS");
    },
    get items() {
      return _.map(tables_from_source_key("CFMRS"), table_to_row_item);
    },
  },
  {
    key: "RPS",
    title: text_maker("rps_title"),
    frequency: text_maker("yearly"),
    get description() {
      return desc_from_glossary_keys("PEOPLE_DATA");
    },
    get items() {
      return _.map(tables_from_source_key("RPS"), table_to_row_item);
    },
  },
  {
    key: "DP",
    title: text_maker("dp_title"),
    frequency: text_maker("yearly"),
    open_data: infobase_open_data_page,
    report_link: {
      en:
        "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/reports-plans-priorities.html",
      fr:
        "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/rapports-plans-priorites.html",
    },
    get description() {
      return desc_from_glossary_keys("DP");
    },
    get items() {
      return _.map(tables_from_source_key("DP"), table_to_row_item).concat([
        {
          id: "dp_results",
          text: text_maker("dp_results_item_name"),
          inline_link:
            "#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_dp)",
        },
      ]);
    },
  },
  {
    key: "DRR",
    title: text_maker("drr_title"),
    frequency: text_maker("yearly"),
    open_data: infobase_open_data_page,
    report_link: {
      en:
        "https://www.canada.ca/en/treasury-board-secretariat/services/departmental-performance-reports.html",
      fr:
        "https://www.canada.ca/fr/secretariat-conseil-tresor/services/rapports-ministeriels-rendement.html",
    },
    get description() {
      return desc_from_glossary_keys("DRR");
    },
    get items() {
      return _.map(tables_from_source_key("DRR"), table_to_row_item).concat([
        {
          id: "drr_results",
          text: text_maker("drr_results_item_name"),
          inline_link:
            "#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_drr)",
        },
      ]);
    },
  },
  {
    key: "IGOC",
    title: text_maker("igoc_source_title"),
    frequency: text_maker("yearly"),
    open_data: infobase_open_data_page,
    description: text_maker("igoc_source_desc"),
    items: [
      {
        id: "igoc",
        text: text_maker("igoc_item_name"),
        inline_link: "#igoc",
      },
    ],
  },
  {
    key: "RTP",
    title: text_maker("transfer_payments_source_title"),
    frequency: text_maker("yearly"),
    open_data: {
      en:
        "https://open.canada.ca/data/en/dataset/69bdc3eb-e919-4854-bc52-a435a3e19092",
      fr:
        "https://ouvert.canada.ca/data/fr/dataset/69bdc3eb-e919-4854-bc52-a435a3e19092",
    },
    description: text_maker("transfer_payments_source_desc"),
    items: [
      {
        id: "rtp",
        text: text_maker("transfer_payments_source_title"),
        inline_link: rpb_link({
          table: "orgTransferPaymentsRegion",
          mode: "details",
        }),
      },
    ],
  },
  services_feature_flag && {
    key: "SERVICES",
    title: text_maker("services_title"),
    frequency: text_maker("yearly"),
    description: text_maker("services_desc"),
    items: [
      {
        id: "service",
        text: text_maker("service_inventory"),
        external_link:
          lang === "en"
            ? "https://open.canada.ca/data/en/dataset/3ac0d080-6149-499a-8b06-7ce5f00ec56c"
            : "https://ouvert.canada.ca/data/fr/dataset/3ac0d080-6149-499a-8b06-7ce5f00ec56c",
      },
    ],
  },
  {
    key: "COVID",
    title: text_maker("covid_title"),
    frequency: text_maker("as_needed"),
    description: <TM k="covid_desc" />,
    open_data: {
      en:
        "https://open.canada.ca/data/en/dataset/9fa1da9a-8c0f-493e-b207-0cc95889823e",
      fr:
        "https://ouvert.canada.ca/data/fr/dataset/9fa1da9a-8c0f-493e-b207-0cc95889823e",
    },
    items: [
      {
        id: "covid_auth_panel",
        text: text_maker("covid_measure_spending_auth"),
        inline_link:
          "#orgs/gov/gov/infograph/covid/.-.-(panel_key.-.-'covid_estimates_panel)",
      },
      {
        id: "covid_exp_panel",
        text: text_maker("covid_expenditures_estimated_exp"),
        inline_link:
          "#orgs/gov/gov/infograph/covid/.-.-(panel_key.-.-'covid_expenditures_panel)",
      },
    ],
  },
])
  .compact()
  .reduce((sources, source) => ({ ...sources, [source.key]: source }), {})
  .value();

const get_source_links = (source_keys) =>
  _.chain(source_keys)
    .map(
      (source_key) =>
        sources[source_key] && {
          html: sources[source_key].title,
          href: `#metadata/${source_key}`,
        }
    )
    .compact()
    .value();

export { sources, get_source_links };
