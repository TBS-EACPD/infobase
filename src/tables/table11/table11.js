import "./table11.ib.yaml";

const {STATS, 
  text_maker, 
  m, 
  Statistics, 
  formats, 
  people_five_year_percentage_formula,
  business_constants : {
    age_groups,
    compact_age_groups, 
    emp_age_map,
  },
  years : { 
    people_years,
    people_years_short_second,
  },
} = require("../table_common");


export default {
  "id": "table11",
  source: ["RPS"],
  "tags": [
    "PEOPLE",
    "FPS",
  ],

  "link": {
    "en": "http://open.canada.ca/data/en/dataset/d712930d-66f4-4377-a2bf-5d55d09c1186",
    "fr": "http://ouvert.canada.ca/data/fr/dataset/d712930d-66f4-4377-a2bf-5d55d09c1186",
  },

  "name": { "en":  "Population by Employee Age Group",
    "fr": "Population selon le groupe d’âge",
  },

  "title": { "en": "Population by Employee Age Group",
    "fr": "Population selon le groupe d’âge",
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
      "key": true,
      "type": "short-str",
      "nick" : 'age',
      "header": {
        "en": "Age Group",
        "fr": "Groupe d’âge",
      },
    });
    _.each(people_years,(header,ix)=>{
      this.add_col({
        "simple_default": ix === 4,
        "type": "big_int_real",
        "nick": header,
        "header": m("{{mar_31}}") + ", " + people_years_short_second[ix],
        "description": {
          "en": "Corresponds to the active employee population by Age Group, as of March 31 " + people_years_short_second[ix],
          "fr": "Correspond à l'effectif actif par groupe d'âge, au 31 mars " + people_years_short_second[ix],
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
      "formula": people_five_year_percentage_formula("age",people_years),
    });
  },
  
  "mapper": function (row) {
    row.splice(1, 1, age_groups[row[1]].text);
    return row;
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
    "high_level_age_split": function(){
      // breakdown the data into 4 individual groups, each of which will need to have it's
      // own seavgperate total calculated
      return _.groupBy(this.data, function(x){
        return emp_age_map[x.age];
      });
    },
    "high_level_rows" : function(){
      var groups = this.high_level_age_split();
      return _.map(compact_age_groups, function(age_group){
        var summed = _.map(people_years, function(year){
          if (groups[age_group]) {
            return d3.sum(groups[age_group], function(row){
              return row[year];
            });
          } else {
            return 0;
          }
        });
        return [age_group].concat(summed);
      });
    },
    "high_level_rows_with_percentage" : function(year) {
      var fm1 = formats["big_int_real"];
      var fm2 = formats.percentage;
      var column = _.map(this.data, year);
      var dept_total = d3.sum(column);
      var groups = this.high_level_age_split();
      // delete missing rows
      //delete groups[undefined]
      // use the keys you've alrady defined and iterate over them in the order
      // of your choice -- impose an order on the unordered groups objects
      var mapfunc = function(key){
        var relevant_group = groups[key];
        var mini_column = _.map(relevant_group, year);
        var group_total = d3.sum(mini_column);
        return [key, fm1(group_total), fm2(group_total/dept_total)];
      };
      return _.map(compact_age_groups, mapfunc);
    },
  },

  "dimensions" : [
    {
      title_key : "age_group_condensed",
      include_in_report_builder : true,

      filter_func: function(options){
        return function(row){
          return emp_age_map[row.age];
        };
      },
    },
    {
      title_key : "age_group",
      include_in_report_builder : true,

      filter_func: function(options){
        return function(row){
          return row.age;
        };
      },
    },
  ],

  "sort": function(mapped_rows, lang){
    return _.sortBy(mapped_rows, function(row){
      var split = row.age.replace(/>|</,"").split("-");
      //console.log(split);
      if (split.length === 2) {
        return +split[1];
      } else {
        split = row.age.split(" ");
        return +split[1] || + split[0];
      }
    });
  },
};

Statistics.create_and_register({
  id: 'table11_dept_info', 
  table_deps: [ 'table11'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table11;
    const q = table.q(subject);
    c.dept = subject;

    var all_years = _.map(q.high_level_rows(), (d) => {
      if(lang === "en"){
        d[0] = d[0].replace("Age ", "");
      }
      return d;
    });
    STATS.year_over_year_multi_stats_active_years(add,"head_count_age",all_years,false,people_years);
  },
});

Statistics.create_and_register({
  id: 'table11_gov_info', 
  table_deps: [ 'table11'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table11;
    const q = table.q(subject);

    var all_years = _.map(q.high_level_rows(), (d) => {
      if(lang === "en"){
        d[0] = d[0].replace("Age ", "");
      }
      return d;
    });

    STATS.year_over_year_multi_stats_active_years(add,"head_count_age",all_years,false,people_years);
  },
});
