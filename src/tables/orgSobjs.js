import text from './orgSobjs.yaml';

// see [here](../table_definition.html) for description
// of the table spec

import { 
  stats, 
  trivial_text_maker, 
  m, 
  Statistics, 
  businessConstants, 
  years,
} from './table_common';

const { sos } = businessConstants;
const { std_years } = years;

export default {
  text,
  "id": "orgSobjs",

  "tags": [
    "SOBJ",
    "EXP",
    "PA",
  ],
  source: [ "PA" ],
  "name": { 
    "en": "Expenditures by Standard Object",
    "fr": "Dépenses par article courant",
  },

  "title": { 
    "en": "Expenditures by Standard Object from {{pa_last_year_5}} to {{pa_last_year}} ($000)",
    "fr": "Dépenses par article courant de {{pa_last_year_5}} à {{pa_last_year}} (en milliers de dollars)",
  },


  add_cols: function(){
    this.add_col( {
      "type": "int",
      "key": true,
      "hidden": true,
      "nick": "dept",
      "header": '',
    });
    this.add_col( {
      "key": true,
      "type": "int",
      "hidden": true,
      "nick": 'so_num',
      "header": {
        "en": "Standard Object",
        "fr": "Article courtant",
      },
    });
    this.add_col( {
      "key": true,
      "type": "str",
      "nick": 'so',
      "header": {
        "en": "Standard Object",
        "fr": "Article courtant",
      },
    });
    _.each(std_years, (header, i) => {
      this.add_col({ 
        "type": "big_int",
        "simple_default": i === 4,
        "nick": header,
        "header": header,
        "description": {
          "en": "Corresponds to the funds spent by standard object in the fiscal year " + header,
          "fr": "Correspond aux dépenses effectuées par article courant durant l'exercice financier " + header,
        },
      });
    });
  },

  "sort": function (rows, lang) {  
    return _.sortBy(rows, function(row){
      return row.so_num;
    });
  },

  "mapper": function (row) {
    if (row[0] !== 'ZGOC') {
      row.splice(2, 0, sos[row[1]].text);
    }
    return row;
  },

  "dimensions": [
    {
      //TODO get rid of this one, we should only be using so_num, not so 
      title_key: "so",

      include_in_report_builder: true,

      filter_func: function(options){
        return function(row){
          return row.so;
        };
      },
    },
    {
      title_key: "so_cat",
      include_in_report_builder: true,

      filter_func: function(options){
        return function(row){
          if (row.so_num > 0 && row.so_num <= 7){
            return trivial_text_maker("op_spending");
          } else if (row.so_num > 7 && row.so_num <= 9) {
            return trivial_text_maker("capital_spending");
          } else if (row.so_num === 21 || row.so_num === 22) {
            return trivial_text_maker("revenues");
          }
          return row.so;
        };
      },
    },
    { 
      title_key: "so_num",
      filter_func: ()=> _.property('so_num'),
    }, 
  ],
};


Statistics.create_and_register({
  id: 'orgSobjs_dept_info', 
  table_deps: [ 'orgSobjs'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    c.dept = subject;
    const table = tables.orgSobjs;
    const q = table.q(subject);
    const last_year_spend = table.so_num("{{pa_last_year}}",subject.id,true);
    const pa_last_year_rev = (last_year_spend[22] || 0) + (last_year_spend[21] || 0);
    add("pa_last_year_rev", pa_last_year_rev);
    add("pa_last_year_rev_minus", -pa_last_year_rev);

    add("pa_last_year_gross_exp", d3.sum(_.map(_.range(1,13), i => last_year_spend[i] || 0)));
    const last_year = q.get_top_x(["so","{{pa_last_year}}"],Infinity,{zip: true,sort_col: "{{pa_last_year}}"});
    const all_years = q.get_top_x(["so"].concat(std_years),Infinity,{zip: true});
    stats.one_year_top3(add, "so",last_year);
    stats.year_over_year_multi_stats(add,"so_five_year",all_years);


    stats.year_over_year_single_stats(
      add, 
      "five_year_exp", 
      _.map(std_years,m),
      _.map(std_years, year => q.sum([year]) )
    );

  },
})

Statistics.create_and_register({
  id: 'orgSobjs_gov_info', 
  table_deps: [ 'orgSobjs'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.orgSobjs;
    const q = table.q(subject);

    stats.year_over_year_single_stats(add, "personnel", _.map(std_years,m),_.map(std_years,(year,i)=>{
      return table.horizontal(year,false)[sos[1].text];
    }));
    var last_year = q.get_top_x(["so","{{pa_last_year}}"],Infinity,{zip: true,sort_col: "{{pa_last_year}}"});
    var all_years = q.get_top_x(["so"].concat(std_years),Infinity,{zip: true});
    stats.one_year_top3(add, "so",last_year);
    stats.year_over_year_multi_stats(add,"so_five_year",all_years);
  },
})
