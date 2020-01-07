import text from './orgTransferPaymentsRegion.yaml';
import {
  businessConstants,
  year_templates,
  Statistics,
} from "./table_common.js";

const { provinces } = businessConstants;
const { std_years } = year_templates;

export default {
  text,
  id: "orgTransferPaymentsRegion",
  source: ["PA"],
  "tags": [
    "EXP",
    "PA",
    "GEO",
    "FPS",
    "ANNUAL",
    "SOBJ10",
  ],

  "link": {
    "en": "RTP_TODO",
    "fr": "RTP_TODO",
  },

  "name": {
    "en": "Transfer Payments by recipient region",
    "fr": "RTP_TODO",
  },

  "title": {
    "en": "Transfer Payments by recipient region",
    "fr": "RTP_TODO",
  },

  "add_cols": function(){
    this.add_col({
      "type": "int",
      "key": true,
      "hidden": true,
      "nick": "dept",
      "header": '',
    });
    this.add_col({
      "type": "short-str",
      "key": true,
      "hidden": true,
      "not_for_display": true,
      "nick": 'region_code',
      "header": "",
    });
    this.add_col({
      "key": true,
      "type": "short-str",
      "nick": 'region',
      "header": {
        "en": "Geographic Region",
        "fr": "Région géographique",
      },
    });
    _.each(
      std_years, 
      (header, ix) => {
        this.add_col({
          "simple_default": ix === 4,
          "type": "big_int",
          "nick": header,
          "header": header,
          "description": {
            "en": "RTP_TODO",
            "fr": "RTP_TODO",
          },
        });
      }
    );
  },

  "mapper": (row) => {
    const [org_id, prov_code, ...values] = row;
    const prov_text = provinces[prov_code].text;
    return [org_id, prov_code, prov_text, ...values];
  },

  "sort": (mapped_rows, lang) => _.sortBy(
    mapped_rows, 
    (row) => {
      if (row.region === provinces.abroad.text){
        return "Z";
      } 
      if (row.region[0] === 'Î'){
        return "I";
      }
      return row.region;
    }
  ),

  "queries": {
    "gov_grouping": () => _.chain( this.table.horizontal(std_years, false) )
      .map( (years, key) => [key].concat(years) )
      .sortBy( (row) => d3.sum( _.tail(row) ) )
      .value(),
  },

  "dimensions": [
    {
      title_key: "prov",
      filter_func: _.constant( _.property('region') ),
      include_in_report_builder: true,
    },
    {
      title_key: "prov_code",
      filter_func: _.constant( _.property('region_code') ),
    },
  ],
};

Statistics.create_and_register({
  id: 'orgTransferPaymentsRegion_dept_info', 
  table_deps: [ 'orgTransferPaymentsRegion'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.orgTransferPaymentsRegion;
    const q = table.q(subject);
    c.dept = subject;

    var all_years = q.get_top_x(["region"].concat(std_years), Infinity, {zip: true});
    // RTP_TODO
  },
});

Statistics.create_and_register({
  id: 'orgTransferPaymentsRegion_gov_info', 
  table_deps: [ 'orgTransferPaymentsRegion'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.orgTransferPaymentsRegion;
    const q = table.q(subject);
    
    var all_years = q.gov_grouping();
    // RTP_TODO
  },
});