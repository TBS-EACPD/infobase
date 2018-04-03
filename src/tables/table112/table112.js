import "./table112.ib.yaml";

import {
  STATS, 
  text_maker, 
  m, 
  Statistics,  
  people_five_year_percentage_formula,
  business_constants,
  years,
} from "../table_common";

const {
  compact_ex_level_map,
  ex_levels,
} = business_constants;
const {
  people_years,
  people_years_short_second,
} = years;

export default {
  "id": "table112",
  source: ["RPS"],
  "tags": [
    "PEOPLE",
    "FPS",
    "EX_LVL",
  ],
  
  "link": {
    "en": "http://open.canada.ca/data/en/", // TODO
    "fr": "http://ouvert.canada.ca/data/fr/", // TODO
  },

  "name": {
    "en": "Population by Executive Level",
    "fr": "Population selon les niveaux des cadres supérieurs",
  },

  "title": {
    "en": "Population by Executive Level",
    "fr": "Population selon les niveaux des cadres supérieurs",
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
      "nick": "ex_lvl",
      "header": text_maker("ex_level"),
    });
    _.each(people_years, (header,ix)=>{
      this.add_col({
        "simple_default": ix === 4,
        "type": "big_int_real",
        "nick": header,
        "header": m("{{mar_31}}") + ", " + people_years_short_second[ix],
        "description": {
          "en": "Corresponds to the active employee population by Executive Level, as of March 31 " +people_years_short_second[ix],
          "fr": "Correspond à l'effectif actif par direction niveaux, au 31 mars "+people_years_short_second[ix],
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
      "formula"  : people_five_year_percentage_formula("ex_lvl",people_years),
    });
  },

  "mapper": function (row) {
    row.splice(1, 1, ex_levels[row[1]].text);
    return row;
  },

  "dimensions": [
    {
      "title_key": "horizontal",
      include_in_report_builder: true,

      filter_func: function(options){
        return function(row){
          return row.ex_lvl;
        };
      },
    },
    {
      title_key: "ex_level_condensed",
      include_in_report_builder: true,

      filter_func: function(options){
        return function(row){
          return compact_ex_level_map[row.ex_lvl];
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
          return d3.sum(_.tail(row));
        })
        .value();
    },
    "summed_levels": function() {
      return _.groupBy(this.data, function(x){
        return compact_ex_level_map[x.ex_lvl];
      });
    },
  },
};

Statistics.create_and_register({
  id: 'table112_dept_info', 
  table_deps: ['table112'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table112;
    const q = table.q(subject);
    c.dept = subject;

    const all_years = q.get_top_x(["ex_lvl", ...people_years], Infinity,{zip:true});
    STATS.year_over_year_multi_stats_active_years(add,"head_count_ex_level_years",all_years,false,people_years);

    const num_active_years = _.chain( all_years )
      .map( group => _.tail(group) )
      .pipe( groups => _.zip.apply(null, groups) )
      .map( zipped_groups => d3.sum(zipped_groups) )
      .countBy( total => total === 0 ? 'inactive' : 'active' ) 
      .pipe( _.property('active') )
      .value();

    const all_years_only_ex = _.filter(all_years, a => (a[0] !== "Non-EX"));
    if ( !_.isEmpty(all_years_only_ex) ){

      STATS.year_over_year_multi_stats_active_years(add,"head_count_ex_level",all_years_only_ex,num_active_years);
      
      const ex_string = window.lang === 'en' ? 'Executive' : 'Cadres supérieurs';
      
      const ex_lev_EX_avg = _.chain( q.summed_levels() )
        .pipe( _.property(ex_string) )
        .pipe( ex_levels => _.map(people_years, y => 
          d3.sum( _.map(ex_levels, _.property(y)) )
        ))
        .pipe( totals_by_year => d3.sum(totals_by_year)/num_active_years )
        .value();
        
      add("head_count_ex_level_avg_ex", ex_lev_EX_avg );
      add("head_count_ex_avg_share", (ex_lev_EX_avg*num_active_years)/d3.sum(_.map(all_years, a => d3.sum(a.slice(1)))));
    } else {

      const not_avail_str = window.lang === 'en' ? 'N.A' : 'S.A';

      add("head_count_count_ex_level_first_active_year", people_years[0]);
      add("head_count_count_ex_level_last_active_year", people_years[4]);
      _.each(
        [
          "head_count_ex_level_top",
          "head_count_ex_level_top_avg", 
          "head_count_ex_level_bottom", 
          "head_count_ex_level_bottom_avg", 
          "head_count_ex_level_avg_ex",
          "head_count_ex_avg_share",		  
        ], 
        key => { add(key, not_avail_str); }
      );
    } 
  },  
});

Statistics.create_and_register({
  id: 'table112_gov_info', 
  table_deps: ['table112'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table112;
    const q = table.q(subject);
    
    const all_years_unfiltered = q.gov_grouping();
    const all_years = _.filter(all_years_unfiltered, a => a[0] !== "Non-EX");
    STATS.year_over_year_multi_stats(add,"head_count_ex_level",all_years);
    const year_group_vals = _.map(all_years, group => _.tail(group) );
    const year_totals = _.map(year_group_vals, d => d3.sum(d) );
    add("head_count_ex_level_avg_ex", d3.sum(year_totals)/5);
    add("head_count_ex_avg_share", (d3.sum(year_totals)/d3.sum(q.sum(people_years, {as_object: false}))));
  },
});
