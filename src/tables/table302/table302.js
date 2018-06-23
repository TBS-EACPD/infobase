import text from "./table302.yaml";

import {
  stats, 
  trivial_text_maker, 
  m, 
  Statistics, 
  people_five_year_percentage_formula,
  businessConstants,
  years,
} from "../table_common";

const { gender } = businessConstants;
const {
  people_years,
  people_years_short_second,
} = years;

export default {
  text,
  "id": "table302",
  source: ["RPS"],
  "tags": [ 
    "PEOPLE",
    "FPS",
    "SUPPRESSED_DATA",
  ],

  "link": {
    "en": "http://open.canada.ca/data/en/dataset/ae34a065-99b9-4e04-90f7-8d29afafc886",
    "fr": "http://ouvert.canada.ca/data/fr/dataset/ae34a065-99b9-4e04-90f7-8d29afafc886",
  },
  
  "name": { 
    "en": "Population by Employee Gender",
    "fr": "Population selon le sexe",
  },

  "title": { 
    "en": "Population by Employee Gender",
    "fr": "Population selon le sexe",
  },

  "add_cols": function(){
    this.add_col({
      "type":"int",
      "key": true,
      "hidden": true,
      "nick": "dept",
      "header": '',
    });
    this.add_col({
      "key": true,
      "type": "int",
      "nick": 'gender',
      "header": trivial_text_maker("employee_gender"),
    });
    _.each(people_years,(header,ix)=>{
      this.add_col({
        "simple_default": ix === 4,
        "type": "big_int_real",
        "nick": header,
        "header": m("{{mar_31}}") + ", " + people_years_short_second[ix],
        "description": {
          "en": "Corresponds to the active employee population by Gender, as of March 31 " + people_years_short_second[ix],
          "fr": "Correspond à l'effectif actif par sexe, au 31 mars " + people_years_short_second[ix],
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
      "formula": people_five_year_percentage_formula("gender",people_years),
    });
  },

  "queries": {
    "gov_grouping": function() {
      return _.chain(this.table.horizontal(people_years,false))
        .map(function(people_years, key){
          return [key].concat(people_years);
        })
        .sortBy(function(row){
          return d3.sum(_.tail(row));
        })
        .value();
    },
  },

  "dimensions": [
    {
      "title_key": "horizontal",
      include_in_report_builder: true,

      filter_func: function(options){
        return function(row){
          return row.gender;
        };
      },
    },
  ],

  "mapper":  function (row) {
    var new_value = gender[row[1]].text;
    row.splice(1, 1, new_value);
    return row;
  },
};

Statistics.create_and_register({
  id: 'table302_dept_info', 
  table_deps: [ 'table302'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table302;
    const q = table.q(subject);
    c.dept = subject;
    
    const all_years = q.get_top_x(["gender"].concat(people_years),Infinity,{zip:true});
    const five_year_total = d3.sum(q.sum(people_years, {as_object: false}));
    
    // Filter out unknowns and suppressed values for sake of multi stats. Note: they're still included in denominator used to calculate separate %'s below
    const all_years_filtered = _.filter(all_years, d => ( (d[0] !== gender.na.text) && (d[0] !== gender.sup.text) ));
    
    if (all_years_filtered.length >= 1) {
      stats.year_over_year_multi_stats_active_years(add,"head_count_gender",all_years_filtered,false,people_years);
                         
      const avg_percent_shares = _.map(all_years_filtered, d => d3.sum(_.tail(d))/five_year_total);
      
      add("head_count_gender_single_type_flag", (avg_percent_shares.length <= 1)); // Flag to switch text between only showing the tip, or showing both the top and bottom percent shares
      
      add("head_count_gender_top_avg_percent_NA_included", _.max(avg_percent_shares));
      add("head_count_gender_bottom_avg_percent_NA_included", _.min(avg_percent_shares));
    } else {
      // To avoid missing_info errors when all data is na or sup, add info using non-filtered data instead
      stats.year_over_year_multi_stats_active_years(add,"head_count_gender",all_years,false,people_years);                     
      const avg_percent_shares = _.map(all_years, d => d3.sum(_.tail(d))/five_year_total);
      add("head_count_gender_single_type_flag", (avg_percent_shares.length <= 1)); // Flag to switch text between only showing the tip, or showing both the top and bottom percent shares
      add("head_count_gender_top_avg_percent_NA_included", _.max(avg_percent_shares));
      add("head_count_gender_bottom_avg_percent_NA_included", _.min(avg_percent_shares));
    }
  },
});

Statistics.create_and_register({
  id: 'table302_gov_info', 
  table_deps: [ 'table302'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table302;
    const q = table.q(subject);
    
    // Filter out unknowns for sake of multi stats, note still included in denominator used to calculate separate %'s below
    // Also filter out suppressed (only for gov level stats)
    const all_years = _.filter(q.gov_grouping(), d => ( (d[0] !== gender.na.text) && (d[0] !== gender.sup.text) )); 

    stats.year_over_year_multi_stats_active_years(add,"head_count_gender",all_years,false,people_years);
    
    const five_year_total = d3.sum(q.sum(people_years, {as_object: false}));
   
    const avg_percent_shares = _.map(all_years, d => d3.sum(_.tail(d))/five_year_total);
    
    add("head_count_gender_top_avg_percent_NA_included", _.max(avg_percent_shares));
    add("head_count_gender_bottom_avg_percent_NA_included", _.min(avg_percent_shares));
  },
});
