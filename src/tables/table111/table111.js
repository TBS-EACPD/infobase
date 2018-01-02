"use strict";
exports = module.exports;
// see [here](../table_definition.html) for description
// of the table spec
require("./table111.ib.yaml");
require("../../graphs/historical_employee_occ_category");

const {
  STATS, 
  text_maker, 
  m, 
  Statistics,
  people_five_year_percentage_formula,
  business_constants : { occupational_category },
  years : {
    people_years,
    people_years_short_second,
  },
} = require("../table_common");

module.exports = {
  "id": "table111",
  source: ["RPS"],
  "tags": [
    "PEOPLE",
    "FPS",
    "OC_PEOPLE",
  ],
  
  "link": {
    "en": "http://open.canada.ca/data/en/", // TODO
    "fr": "http://ouvert.canada.ca/data/fr/", // TODO
  },
  
  "name": {
    "en":  "Population by Occupational Category",
    "fr":  "Population selon la catégorie professionnelle",
  },

  "title": {
    "en": "Population by Occupational Category",
    "fr": "Population selon la catégorie professionnelle",
  },

  "add_cols": function () {
    this.add_col({
      "type": "int",
      "key": true,
      "hidden": true,
      "nick": "dept",
      "header": '',
    });
    this.add_col({
      "type": "int",
      "key": true,
      "nick": "occ_cat",
      "header": text_maker("occupational_cat"),
    });
    _.each(people_years, (header, ix) => {
      this.add_col({ 
        "simple_default": ix === 4,
        "type": "big_int_real",
        "nick": header,
        "header": m("{{mar_31}}") + ", " + people_years_short_second[ix],
        "description": {
          "en": "Corresponds to the active employee population by Occupational Category, as of March 31 " +people_years_short_second[ix],
          "fr": "Correspond à l'effectif actif par catégorie professionnelle, au 31 mars "+people_years_short_second[ix],
        },
      });
    });
    this.add_col({
      "type": "percentage1",
      "nick": "five_year_percent",
      "header": text_maker("five_year_percent_header"),
      "description": {
        "en": text_maker("five_year_percent_description"),
        "fr": text_maker("five_year_percent_description"),
      },
      "formula": people_five_year_percentage_formula("occ_cat",people_years),
    });
  },

  "mapper": function (row) {
    var new_value = occupational_category[row[1]].text;
    row.splice(1, 1, new_value);
    return row;
  },

  "dimensions": [
    {
      "title_key": "horizontal",
      include_in_report_builder : true,

      filter_func :function(options){
        return function(row){
          return row.occ_cat;
        };
      },
    },
  ],

  "queries": {
    "gov_grouping": function() {
      return _.chain(this.table.horizontal(people_years,false))
        .map(function(years, key){
          return [key].concat(years);
        })
        .sortBy(function(row){
          return d4.sum(_.tail(row));
        })
        .value();
    },
  },
};

Statistics.create_and_register({
  id: 'table111_dept_info', 
  table_deps: [ 'table111'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table111;
    const q = table.q(subject);
    c.dept = subject;

    const all_years = q.get_top_x(["occ_cat"].concat(people_years),Infinity,{zip:true});
    STATS.year_over_year_multi_stats_active_years(add,"head_count_occ_cat",all_years, false, people_years);


    const exec_row = _.find(
      q.data, 
      {
        occ_cat : (
          window.lang === 'en' ?  
          "Executive and Law Management" :
          "Cadres supérieurs et gestion du droit"
        ),
      }
    );

        
    let avg_ex_share;
    if (exec_row) {
      const exec_vals = _.map(people_years, y => exec_row[y] )
      const dept_rows = table.depts[subject.id];

      const total_dept_vals = _.map(people_years, y => d4.sum( _.map(dept_rows, _.property(y))));
              
      avg_ex_share = d4.sum(exec_vals)/d4.sum(total_dept_vals);

    } else {
      avg_ex_share = 0;
    }
    
    add("head_count_occ_cat_avg_share_ex", avg_ex_share);
  },  
});

Statistics.create_and_register({
  id: 'table111_gov_info', 
  table_deps: [ 'table111'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table111;
    const q = table.q(subject);
    
    add( "five_year_total_head_count", d4.sum(q.sum(people_years, {as_object: false}))); // Used to calculate %'s for gov pie chart
    
    const all_years = q.gov_grouping();
    
    STATS.year_over_year_multi_stats(add,"head_count_occ_cat",all_years);

    const exec_rows = _.filter(
      table.data, 
      {
        occ_cat : (
          window.lang === 'en' ?  
          "Executive and Law Management" :
          "Cadres supérieurs et gestion du droit"
        ),
      }
    );
        
    const exec_totals = _.map(
      people_years,
      y => d4.sum( _.map(exec_rows, _.property(y) ))
    );
    
    add("head_count_occ_cat_avg_share_ex", d4.sum(exec_totals)/d4.sum(q.sum(people_years, {as_object: false})));

  },
});


