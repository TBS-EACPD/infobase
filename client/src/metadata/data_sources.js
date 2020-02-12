import data_source_text from './data_sources.yaml';
import freq_text from './frequencies.yaml';

//circular dependency hack..
import { Table } from '../core/TableClass.js';
import { rpb_link } from '../rpb/rpb_link.js';
import { GlossaryEntry } from '../models/glossary.js';
import { create_text_maker } from '../models/text.js';

const tm = create_text_maker([data_source_text, freq_text]);

const frequencies = {
  m: {
    get text(){ return tm("monthly"); },
  },
  q: {
    get text(){ return tm("quarterly"); },
  },
  y: {
    get text(){ return tm("yearly"); },
  },
};

//returns react elements
function desc_from_gloss_keys(...glossary_keys){
  const definitions = _.map(glossary_keys, glossary_key => GlossaryEntry.lookup(glossary_key).definition );
  return _.map(definitions, (def,ix)=> <div key={ix} dangerouslySetInnerHTML={{__html: def }} /> );
}

function tables_from_source_key(source_key){
  return _.filter(Table.get_all(), table => _.includes(table.source, source_key) );
}

function table_to_row_item(table){
  return {
    key: table.id,
    text: table.name,
    inline_link: (
      !table.no_link && 
      rpb_link({
        table: table.id,
        mode: 'details',
      })
    ),
    external_link: table.link[window.lang],
  };
}

const infobase_open_data_page = {
  en: "http://open.canada.ca/data/en/dataset/a35cf382-690c-4221-a971-cf0fd189a46f",
  fr: "https://ouvert.canada.ca/data/fr/dataset/a35cf382-690c-4221-a971-cf0fd189a46f",
};

const sources = _.mapValues({
  PA: {
    ix: 1,
    description(){ return desc_from_gloss_keys("PA"); },
    title(){ return tm("pa_title" );},
    frequency: frequencies.y,
    open_data: infobase_open_data_page,
    report_link: {
      en: "http://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/index-eng.html",
      fr: "http://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/index-fra.html",
    },
    items(){ 
      return _.map(
        tables_from_source_key("PA"),
        table_to_row_item
      );
    },
  },
  QFR: {
    ix: 4,
    description(){ return desc_from_gloss_keys("QFR"); },
    title(){ return tm("qfr_title" );},
    frequency: frequencies.q,
    report_link: {
      en: "https://www.canada.ca/en/treasury-board-secretariat/services/reporting-government-spending/quarterly-financial-reporting.html",
      fr: "https://www.canada.ca/fr/secretariat-conseil-tresor/services/etablissement-rapports-depenses/rapports-financiers-trimestriels.html",
    },
    items(){ 
      return _.map(
        tables_from_source_key("QFR"),
        table_to_row_item
      );
    },
  },
  ESTIMATES: {
    ix: 2,
    description(){ return desc_from_gloss_keys("MAINS", "SUPPS"); },
    title(){ return tm("estimates_title" ); },
    frequency: frequencies.q,
    open_data: infobase_open_data_page,
    report_link: {
      en: "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/government-expenditure-plan-main-estimates.html",
      fr: "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/plan-depenses-budget-principal.html",
    },
    items(){ 
      return _.map(
        tables_from_source_key("ESTIMATES"),
        table_to_row_item
      );
    },
  },
  CFMRS: {
    ix: 3,
    description(){ return desc_from_gloss_keys("CFMRS"); },
    title(){ return tm("cfmrs_title" ); },
    open_data: {
      en: "http://open.canada.ca/data/en/dataset/5e6dcf6b-dbed-4b51-84e5-1f4926ad7fdf",
      fr: "http://ouvert.canada.ca/data/fr/dataset/5e6dcf6b-dbed-4b51-84e5-1f4926ad7fdf",
    },
    frequency: frequencies.y,
    items(){ 
      return _.map(
        tables_from_source_key("CFMRS"),
        table_to_row_item
      );
    },
  },
  RPS: {
    description(){ return desc_from_gloss_keys("PEOPLE_DATA"); },
    ix: 0,
    title(){ return tm("rps_title" ); },
    frequency: frequencies.y,
    items(){ 
      return _.map(
        tables_from_source_key("RPS"),
        table_to_row_item
      );
    },
  },
  DP: {
    description(){ return desc_from_gloss_keys("DP"); },
    title(){ return tm("dp_title"); },
    frequency: frequencies.y,
    open_data: infobase_open_data_page,
    report_link: {
      en: "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/reports-plans-priorities.html",
      fr: "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/rapports-plans-priorites.html",
    },
    items(){ 
      return _.map(
        tables_from_source_key("DP"),
        table_to_row_item
      ).concat([{
        id: 'dp_results',
        text: tm("dp_results_item_name"),
        inline_link: "#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_dp)",
      }]);
    },
  },
  DRR: {
    title(){ return tm("drr_title");},
    description(){ return desc_from_gloss_keys("DRR"); },
    frequency: frequencies.y,
    open_data: infobase_open_data_page,
    report_link: {
      en: "https://www.canada.ca/en/treasury-board-secretariat/services/departmental-performance-reports.html",
      fr: "https://www.canada.ca/fr/secretariat-conseil-tresor/services/rapports-ministeriels-rendement.html",
    },
    items(){ 
      return _.map(
        tables_from_source_key("DRR"),
        table_to_row_item
      ).concat([{
        id: 'drr_results',
        text: tm("drr_results_item_name"),
        inline_link: "#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_drr)",
      }]);
    },
  }, 
  IGOC: {
    title(){ return tm("igoc_source_title"); },
    description(){ return tm("igoc_source_desc"); },
    frequency: frequencies.y,
    open_data: infobase_open_data_page,
    items(){
      return [{
        id: 'igoc',
        text: tm("igoc_item_name"),
        inline_link: "#igoc",
      }];
    },
  },
  BUDGET: {
    title(){ return tm("budget_source_title");},
    description(){ return <div dangerouslySetInnerHTML={{ __html: tm("budget_source_desc") }}/>; },
    frequency: frequencies.m,
    open_data: infobase_open_data_page,
    items(){
      return [
        {
          id: 'budget_dept',
          text: tm("budget_dept_item_name"),
          inline_link: "#budget-tracker/budget-measure/overview",
        },
        {
          id: 'budget_program',
          text: tm("budget_program_item_name"),
          inline_link: "#budget-tracker/budget-measure/overview",
        },
        {
          id: 'budget_supplemental',
          text: tm("budget_program_supplemental_name"),
          inline_link: "#budget-tracker/budget-measure/overview",
        },
      ];
    },
  },
   RTP: {
     title(){ return tm("transfer_payments_source_title"); },
     description(){ return tm("transfer_payments_source_desc"); },
     frequency: frequencies.y,
     open_data: {
       en: "https://open.canada.ca/data/en/dataset/69bdc3eb-e919-4854-bc52-a435a3e19092",
       fr: "https://ouvert.canada.ca/data/fr/dataset/69bdc3eb-e919-4854-bc52-a435a3e19092",
     },
     items(){
       return [{
         id: 'rtp',
         text: tm("transfer_payments_source_title"),
         inline_link: rpb_link({
           table: 'orgTransferPaymentsRegion',
           mode: 'details',
         }),
       }];
     },
   },
}, (obj, key) => ({...obj, key}));


const get_source_links = (source_keys) => _.chain(source_keys)
  .map(
    source_key => (sources[source_key] && 
      {
        html: sources[source_key].title(),
        href: `#metadata/${source_key}`,
      }
    )
  )
  .compact()
  .value();

export { 
  sources,
  get_source_links,
};
