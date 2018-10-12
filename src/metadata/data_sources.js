import data_source_text from './data_sources.yaml';
import freq_text from './frequencies.yaml';

//circular dependency hack..
import { Table } from '../core/TableClass.js';
import { rpb_link } from '../rpb/rpb_link.js';
import { GlossaryEntry } from '../models/glossary.js';
import { create_text_maker } from '../models/text.js';

const tm = create_text_maker([data_source_text, freq_text]);

const frequencies = {
  m : {
    get text(){ return tm("monthly"); },
  },
  q : {
    get text(){ return tm("quarterly"); },
  },
  y : {
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
  }
}

const sources = _.mapValues({
  PA: {
    ix: 1,
    description(){ return desc_from_gloss_keys("PA") },
    title(){ return tm("pa_title" )},
    last_updated : {"month" : 10,"year":2017},
    open_data: {
      en: "http://open.canada.ca/data/en/dataset/51c3b869-9182-4ee3-a7c2-36da0dc2889c",
      fr: "http://ouvert.canada.ca/data/fr/dataset/51c3b869-9182-4ee3-a7c2-36da0dc2889c",
    },
    frequency: frequencies.y,
    report_link:{
      en:"http://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/index-eng.html",
      fr:"http://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/index-fra.html",
    },
    items(){ 
      return  _.map(
        tables_from_source_key("PA"),
        table_to_row_item
      );
    },
  },
  QFR: {
    ix: 4,
    description(){ return desc_from_gloss_keys("QFR") },
    title(){ return tm("qfr_title" )},
    last_updated: { month: 11, year: 2017 },
    frequency: frequencies.q,
    report_link:{
      en:"https://www.canada.ca/en/treasury-board-secretariat/services/reporting-government-spending/quarterly-financial-reporting.html",
      fr:"https://www.canada.ca/fr/secretariat-conseil-tresor/services/etablissement-rapports-depenses/rapports-financiers-trimestriels.html",
    },
    items(){ 
      return  _.map(
        tables_from_source_key("QFR"),
        table_to_row_item
      );
    },
  },
  ESTIMATES: {
    ix: 2,
    description(){ return desc_from_gloss_keys("MAINS", "SUPPS") },
    title(){ return tm("estimates_title" )},
    last_updated: { month: 4, year: 2018 },
    open_data: {
      en: "http://open.canada.ca/data/en/dataset/43e5952e-29d2-43d9-817d-92cf87d44ce5",
      fr: "http://ouvert.canada.ca/data/fr/dataset/43e5952e-29d2-43d9-817d-92cf87d44ce5",
    },
    frequency: frequencies.q,
    report_link:{
      en:"https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/government-expenditure-plan-main-estimates.html",
      fr:"https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/plan-depenses-budget-principal.html",
    },
    items(){ 
      return  _.map(
        tables_from_source_key("ESTIMATES"),
        table_to_row_item
      );
    },
  },
  CFMRS: {
    ix: 3,
    description(){ return desc_from_gloss_keys("CFMRS") },
    title(){ return tm("cfmrs_title" )},
    last_updated: { month: 10, year: 2017 },
    open_data: {
      en: "http://open.canada.ca/data/en/dataset/5e6dcf6b-dbed-4b51-84e5-1f4926ad7fdf",
      fr: "http://ouvert.canada.ca/data/fr/dataset/5e6dcf6b-dbed-4b51-84e5-1f4926ad7fdf",
    },
    frequency: frequencies.y,
    items(){ 
      return  _.map(
        tables_from_source_key("CFMRS"),
        table_to_row_item
      );
    },
  },
  RPS: {
    description(){ return desc_from_gloss_keys("PEOPLE_DATA") },
    ix: 0,
    title(){ return tm("rps_title" )},
    last_updated: { month: 2, year: 2018 },
    frequency: frequencies.y,
    items(){ 
      return  _.map(
        tables_from_source_key("RPS"),
        table_to_row_item
      );
    },
  },
  DP: {
    description(){ return desc_from_gloss_keys("DP") },
    title(){ return tm("dp_title")},
    frequency: frequencies.y,
    last_updated : {month : 4, year:2018},
    report_link:{
      en: "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/reports-plans-priorities.html",
      fr: "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/rapports-plans-priorites.html",
    },
    open_data:{
      en: "http://open.canada.ca/data/en/dataset/e03ef931-c096-4710-bc4a-1fcd0cc0ea00",
      fr: "http://ouvert.canada.ca/data/fr/dataset/e03ef931-c096-4710-bc4a-1fcd0cc0ea00",
    },
    items(){ 
      return  _.map(
        tables_from_source_key("DP"),
        table_to_row_item
      ).concat([{
        id: 'dp_results',
        text: tm("dp_results_item_name"),
      }])
    },
  },
  DRR: {
    title(){ return tm("drr_title")},
    description(){ return desc_from_gloss_keys("DRR") },
    frequency: frequencies.y,
    last_updated : {month : 11,year:2017},
    report_link:{
      en:"https://www.canada.ca/en/treasury-board-secretariat/services/departmental-performance-reports.html",
      fr:"https://www.canada.ca/fr/secretariat-conseil-tresor/services/rapports-ministeriels-rendement.html",
    },
    open_data:{
      en: "http://open.canada.ca/data/en/dataset/311842ca-7958-40fa-8e31-12d11c6223e3",
      fr: "http://ouvert.canada.ca/data/fr/dataset/311842ca-7958-40fa-8e31-12d11c6223e3",
    },
    items(){ 
      return  _.map(
        tables_from_source_key("DRR"),
        table_to_row_item
      ).concat([{
        id: 'drr_results',
        text: tm("drr_results_item_name"),
      }]);
    },
  }, 
  IGOC: {
    title(){ return tm("igoc_source_title")},
    description(){ return tm("igoc_source_desc"); },
    frequency: frequencies.y,
    last_updated: { month: 11, year: 2017 },
    open_data: {
      en:"http://open.canada.ca/data/en/dataset/c05e8a2b-4e8b-4da7-b6f3-33f4848d3c09",
      fr:"http://ouvert.canada.ca/data/fr/dataset/c05e8a2b-4e8b-4da7-b6f3-33f4848d3c09",
    },
    items(){
      return [{
        id: 'igoc',
        text: tm("igoc_item_name"),
      }];
    },
  },
  BUDGET: {
    title(){ return tm("budget_source_title")},
    description(){ return <div dangerouslySetInnerHTML={{ __html: tm("budget_source_desc") }}/>; },
    frequency: frequencies.m,
    last_updated: { month: 6, year: 2018 },
    open_data: {
      en:"http://open.canada.ca/data/en/dataset/a35cf382-690c-4221-a971-cf0fd189a46f",
      fr:"https://ouvert.canada.ca/data/fr/dataset/a35cf382-690c-4221-a971-cf0fd189a46f",
    },
    items(){
      return [{
        id: 'budget',
        text: tm("budget_item_name"),
        inline_link: "#budget-measures/budget-measure/overview",
      }];
    },
  },
}, (obj, key) => ({...obj, key}));

export { 
  sources,
};
