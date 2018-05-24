import text from "./table304.yaml";

import {
  trivial_text_maker, 
  m, 
  Statistics, 
  years,
} from "../table_common";

const {
  people_years,
  people_years_short_second,
} = years;

export default {
  text,
  "id": "table304",
  source: ["RPS"],
  "tags" : [
    "PEOPLE",
    "FPS",
  ],
  
  "link": {
    "en": "http://open.canada.ca/data/en/dataset/ccf74651-aef9-4f9e-b13c-f4bf15f18697",
    "fr": "http://ouvert.canada.ca/data/fr/dataset/ccf74651-aef9-4f9e-b13c-f4bf15f18697",
  },

  "name": {
    "en": "Average Age", 
    "fr": "Âge moyen",
  },

  "title": {
    "en": "Average Age", 
    "fr": "Âge moyen",
  },

  "add_cols": function () {
    this.add_col({
      "type": "int",
      "key": true,
      "hidden": true,
      "nick": "dept",
      "header": "",
    });
    this.add_col({
      "type": "wide-str",
      "key": true,
      "hidden": true,
      "nick": "avgage",
      "header": trivial_text_maker("avgage"),
    });
    _.each(people_years, (header,ix)=>{
      this.add_col({
        "simple_default": ix === 4,
        "type": "decimal1",
        "nick": header,
        "header": m("{{mar_31}}") + ", " + people_years_short_second[ix],
        "description": {
          "en": "Corresponds to the departmental average age, as of March 31 "+people_years_short_second[ix],
          "fr": "Correspond à l'âge moyen au ministère, au 31 mars "+people_years_short_second[ix],
        },
        "formula" : function(table,row){
          // Displays FPS total average as the total row in every case except when you have a single department selected; good enough
          // although it would be okay if it just always did, and even better if we could clarify that it is the total FPS weighted average in the text
          if (_.isArray(row)){
            if (row.length === table.data.length ) {
              return  table.GOC[0][header];
            } else if(row.length === 1) {
              return row[0][header];
            } else {
              return  table.GOC[0][header];
            }
          }
          return row[header];
        },
      });
    });
  },

  "mapper": function (row) { 
    row.splice(1,1,trivial_text_maker("avgage"));
    return row;
  },

  "queries" : {
    "gov_grouping" : function() {
      return _.chain(this.table.horizontal(people_years,false))
        .map(function(people_years, key){
          return [key].concat(people_years);
        })
        .sortBy(function(row){
          return d3.sum(_.tail(row));
        })
        .value();
    },
    "ZGOC_row" : function() {
      var table = this.table;
      var data_temporary = _.map(people_years, function(year){
        return table.GOC[0][year];
      });
      return data_temporary;
    },
  },

  "details" : { 
    "prepare_total" : function(col_objs,raw_data){ 
      return [];
    },
  },

  "dimensions" : [
    {
      "title_key" : "horizontal",
      include_in_report_builder : true,

      filter_func :function(options){
        return function(row){
          return trivial_text_maker("fps");
        };
      },
    },
  ],
};

Statistics.create_and_register({
  id: 'table304_dept_info', 
  table_deps: [ 'table304'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table304;
    const q = table.q(subject);
    c.dept = subject;
    
    const dept_data = _.map(people_years, d => q.data[0][d]);
    const first_active = _.findIndex(dept_data, d => d !== 0);
    const last_active = _.findLastIndex(dept_data, d => d !== 0);
    
    add("avgage_first_active_year",m(people_years[first_active]));
    add("avgage_first_active_value",dept_data[first_active]);
    add("avgage_last_active_year",m(people_years[last_active]));
    add("avgage_last_active_value",dept_data[last_active]);
    
    const dept_avg_change = _.chain(dept_data)
      .filter((d,i) => ((i>= first_active) && (i <= last_active)))
      .reduce((memo, val, i, dept_data) => {
        if ((i+1) < dept_data.length) {
          return (memo*i + (dept_data[i+1]-val))/(i+1);
        } else {
          return memo;
        }
      },0)
      .value();
    
    add("avgage_avg_change",dept_avg_change);
    
    const gov_avg_change = _.chain(people_years)
      .filter((d,i) => ((i>= first_active) && (i <= last_active)))
      .map(y => table.GOC[0][y])
      .reduce((memo, val, i, dept_data) => {
        if ((i+1) < dept_data.length) {
          return (memo*i + (dept_data[i+1]-val))/(i+1);
        } else {
          return memo;
        }
      },0)
      .value();
    
    add("gov_avgage_avg_change",gov_avg_change);
  },
});

Statistics.create_and_register({
  id: 'table304_gov_info', 
  table_deps: [ 'table304'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table304;

    const data = _.map(people_years, y => table.GOC[0][y]);
    
    add("avgage_last_year_5",data[0]);
    add("avgage_last_year",data[4]);
    
    const avg_change = _.reduce(data,
      (memo, val, i, data) => {
        if ((i+1) < data.length) {
          return (memo*i + (data[i+1]-val))/(i+1);
        } else {
          return memo;
        }
      },
      0);
    
    add("avgage_avg_change",avg_change);
  },
});
