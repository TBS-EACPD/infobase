import text from './orgTransferPaymentsRegion.yaml';
import {
  businessConstants,
  years,
} from "./table_common";

const { provinces } = businessConstants;
const { std_years } = years;

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
    "en": "Transfer Payments by Geographic Region",
    "fr": "Paiements de transfert selon la région géographique",
  },

  "title": {
    "en": "Transfer Payments by Geographic Region",
    "fr": "Paiements de transfert selon la région géographique",
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
    _.each(std_years, (header,ix)=>{
      this.add_col({
        "simple_default": ix === 4,
        "type": "big_int",
        "nick": header+'exp',
        "header": {
          "en": "Expenditures",
          "fr": "Dépenses",
        },
        "description": {
          "en": "RTP_TODO",
          "fr": "RTP_TODO",
        },
      });
    });
  },

  "mapper": function (row) {
    var new_value = provinces[row[1]].text;
    row.splice(2, 0, new_value);
    return row;
  },

  "sort": function(mapped_rows, lang){
    return _.sortBy(mapped_rows, function(row){
      if (row.region === provinces.abroad.text){
        return "Z";
      } 
      if (row.region[0] === 'Î'){
        return "I";
      }
      return row.region;
    });
  },

  "queries": {
    "gov_grouping": function() {
      return _.chain(this.table.horizontal(std_years,false))
        .map(function(years, key){
          return [key].concat(years);
        })
        .sortBy(function(row){
          return d3.sum(_.tail(row));
        })
        .value();
    },
  },

  "dimensions": [
    {
      title_key: "prov",
      filter_func: _.constant(_.property('region') ),
      include_in_report_builder: true,
    },
    {
      title_key: "prov_code",
      filter_func: _.constant( _.property('region_code') ),
    },
  ],
};