import "./table10.ib.yaml";

import {
  STATS, 
  trivial_text_maker, 
  m, 
  Statistics, 
  formats, 
  people_five_year_percentage_formula,
  business_constants,
  years,
} from "../table_common";

const {provinces} = business_constants;
const { 
  people_years, 
  people_years_short_second,
} = years;

export default {
  "id": "table10",
  source: ["RPS"],
  "tags": [
    "PEOPLE",
    "GEO",
    "FPS",
  ],

  "link": {
    "en": "http://open.canada.ca/data/en/dataset/933f8f6e-daee-4368-a7dc-4eadc8b5ecfa",
    "fr": "http://ouvert.canada.ca/data/fr/dataset/933f8f6e-daee-4368-a7dc-4eadc8b5ecfa",
  },

  "name": {
    "en": "Population by Geographic Region",
    "fr": "Population selon la région géographique",
  },

  "title": {
    "en": "Population by Geographic Region",
    "fr": "Population selon la région géographique",
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
    _.each(people_years, (header,ix)=>{
      this.add_col({
        "simple_default": ix === 4,
        "type": "big_int_real",
        "nick": header,
        "header": m("{{mar_31}}") + ", " + people_years_short_second[ix],
        "description": {
          "en": "Corresponds to the active employee population by Geographic Region, as of March 31 " + people_years_short_second[ix],
          "fr": "Correspond à l'effectif actif par région géographique, au 31 mars " + people_years_short_second[ix],
        },
      });
    });
    this.add_col({
      "type": "percentage1",
      "nick": "five_year_percent",
      "header": trivial_text_maker("five_year_percent_header"),
      "description": {
        "en": trivial_text_maker("five_year_percent_description"),
        "fr": trivial_text_maker("five_year_percent_description"),
      },
      "formula": people_five_year_percentage_formula("region",people_years),
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
      return _.chain(this.table.horizontal(people_years,false))
        .map(function(years, key){
          return [key].concat(years);
        })
        .sortBy(function(row){
          return d3.sum(_.tail(row));
        })
        .value();
    },
    "high_level_prov_split": function (year, options) {
      options = options || {};
      var lk = provinces,
        format = options.format || false,
        fm1 = formats["big_int_real"],
        fm2 = formats.percentage,
        ncr = this.lang === 'en' ? "NCR" : "RCN",
        non_ncr = "Non-"+ncr,
        abroad = lk.abroad.text,
        dept_total = d3.sum(this.data, function (d) {
          return d[year];
        });
      var groups = _.groupBy(this.data, function (x) {
        if (x.region_code === 'ncr') {
          return ncr;
        } else if (x.region_code === "abroad") {
          return abroad;
        } else {
          return non_ncr;
        }
      }, this);
      return _.map([ncr, non_ncr, abroad], function (key) {
        var relevant_group = groups[key];
        var sub_column = _.map(relevant_group, year);
        var group_total = d3.sum(sub_column);
        if (format) {
          return [key, fm1(group_total), fm2(group_total / dept_total)];
        } else {
          return [key, group_total, group_total / dept_total];
        }
      });
    },
  },

  "dimensions": [
    {
      title_key: "prov",
      filter_func: _.constant(_.property('region') ),
    },
    {
      title_key: "prov_code",
      exclude_from_rpb: true,
      filter_func: _.constant( _.property('region_code') ),
    },
  ],
};

Statistics.create_and_register({
  id: 'table10_dept_info', 
  table_deps: [ 'table10'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table10;
    const q = table.q(subject);
    c.dept = subject;

    var all_years = q.get_top_x(["region"].concat(people_years),Infinity,{zip:true});
    STATS.year_over_year_multi_stats_active_years(add,"head_count_region",all_years,false,people_years);
  },
});

Statistics.create_and_register({
  id: 'table10_gov_info', 
  table_deps: [ 'table10'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table10;
    const q = table.q(subject);
    
    var all_years = q.gov_grouping();
    STATS.year_over_year_multi_stats_active_years(add,"head_count_region",all_years,false,people_years);
  },
});

