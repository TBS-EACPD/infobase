import text from './orgCoreEstimates.yaml';
import * as FORMAT from '../core/format';
import {
  trivial_text_maker, 
  Statistics, 
  Subject,
  years,
  businessConstants,
} from './table_common';
const { CRSO } = Subject;
const { estimates_years } = years;
const est_cols = _.map(estimates_years, yr => yr+"_estimates");
const in_year_col = est_cols[4];
const last_year_col = est_cols[3];

const { estimates_docs } = businessConstants;

const map_helper = {
  "ME": "MAINS",
};

export default {
  text,
  id: "orgCoreEstimates",
  legacy_id: "",
  tags: [
    "AUTH",
    "EST_PROC",
    "PLANNED_EXP_TAG",
  ],

  source: ["ESTIMATES"],

  "name": { 
    "en": "Tabled Estimates by Core Responsibility",
    "fr": "Budgets déposés TODO TODO",
  },

  "title": {
    "en": "Tabled Estimates by Core Responsibility ($000)",
    "fr": "Budgets déposés TODO TODO (en milliers de dollars)",
  },

  // TODO: check if this is still right--do we need to recategorize footnotes?
  "footnote-topics": {
    "group": ["mains_text"],
    "table": ["~main_text","mains_text_gov"],
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
      "type": "str",
      "key": true,
      "hidden": true,
      "nick": "crso_id",
    });
    this.add_col({ // TODO: why is this here?
      "type": "wide-str",
      "key": true,
      "nick": "cr_name",
      "header": {
        "en": "Core Responsibility",
        "fr": "Responsabilité Essentielle",
      },
    });
    this.add_col({
      "type": "wide-str",
      "key": true,
      "nick": "est_doc",
      "header": {
        "en": "Estimates Instrument",
        "fr": "Instrument des dépenses",
      },
    });
    _.each(estimates_years, (yr, ix) => { 
      this.add_col({
        "simple_default": ix === 4, // TODO: I think this changes if the number of years changes
        type: "big_int",
        nick: yr+"_estimates",
        description: {
          en: "Tabled Amounts for "+yr,
          fr: "Montants déposés pour "+yr,
        },
        header: yr,
      });
    });
  },

  "mapper": function (row) {	 
    if (row[2] in map_helper) { 
      row[2] = map_helper[row[2]]; 
    }
    row.splice(2, 1, estimates_docs[row[2]][window.lang]);

    const cr = CRSO.get_from_id(row[1]);
    row.splice(2,0,cr.name);
    return row;
  },

  "queries": {
    // TODO: check if this works properly
    "estimates_split": function(options,format){
      debugger;
      format = format || false;
      const col = options.col || in_year_col;
      var filter = options.filter;
      var add_percentage = options.add_percentage || false;
      var filter_zeros = options.filter_zeros || false;
      var compress_carry_fws = options.compress_carry_fws || false;
      var total = this.sum(col)+1;
      var dept = this.dept || false;
      var dimension = "by_estimates_doc";
      if (compress_carry_fws){
        dimension = "by_estimates_doc_compressed"
      }
      return _.chain(this.table[dimension](col,dept,false))
        .toPairs()
        .sortBy(function(est_doc_lines){
          var first_line = est_doc_lines[1][0];
          return estimates_docs[first_line.est_doc_code].order;
        })
        .map((est_doc_lines)=>{
          var est_doc = est_doc_lines[0];
          var est_lines = est_doc_lines[1];
          var est_amnt ; 
          // filter out lines of a provided vote number (this won't work for stat items)
          if (filter){
            est_lines = _.filter(est_lines, filter);
          } 
          est_amnt = d3.sum(_.map(est_lines, col));
          if (add_percentage) {
            return [est_doc, est_amnt, est_amnt/total];
          } else {
            return [est_doc, est_amnt];
          }
        })
        .filter(function(row){
          if (filter_zeros){
            return row[1] !== 0;
          } else {
            return true;
          }
        })
        .map(function(row){
          if (format) {
            if (add_percentage) {
              return FORMAT.list_formater(["", "big-int", "percentage"], row);
            } else {
              return FORMAT.list_formater(["", "big-int"], row);
            }
          }
          return row;
        })
        .value();
    },
  },

  // TODO: fix this
  "sort": function (mapped_rows, lang) {
    var grps = _.groupBy(mapped_rows, function (row) { 
      return _.isNumber(row.votenum);
    });
    if ( _.has(grps, false) ){
      grps[false] = _.sortBy(grps[false], function (row) { return row[0]; });
    } else {
      grps[false] = [];
    }
    if ( _.has(grps, true) ){
      grps[true] = _.sortBy(grps[true], function (row) { 
        return row.votenum; 
      });
    } else {
      grps[true] = [];
    }
    return grps[true].concat(grps[false]);
  },

  "dimensions": [
    {
      title_key: "by_estimates_doc",
      include_in_report_builder: true,
      filter_func: function(options){
        return function(d){
          return d.est_doc;
        };
      },
    },
  ],
};


Statistics.create_and_register({
  id: 'orgCoreEstimates_cr_info', 
  table_deps: [ 'orgCoreEstimates'],
  level: 'crso',
  compute: (subject, tables, infos, add, c) => {
    c.dept = subject;
    const table = tables.orgVoteStatEstimates;
    const q = table.q(subject);
    _.each(est_cols, yr => {
      add("tabled_"+yr, q.sum(yr));
    })

    add('in_year_estimates_split', q.estimates_split({filter_zeros: true, as_tuple: true, col: in_year_col}) )
    add('last_year_estimates_split', q.estimates_split({filter_zeros: true, as_tuple: true, col: last_year_col}) )
  },
});

Statistics.create_and_register({
  id: 'orgCoreEstimates_dept_info', 
  table_deps: [ 'orgCoreEstimates'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    c.dept = subject;
    const table = tables.orgVoteStatEstimates;
    const q = table.q(subject);
    _.each(est_cols, yr => {
      add("tabled_"+yr, q.sum(yr));
    })

    add('in_year_estimates_split', q.estimates_split({filter_zeros: true, as_tuple: true, col: in_year_col}) )
    add('last_year_estimates_split', q.estimates_split({filter_zeros: true, as_tuple: true, col: last_year_col}) )
  
  },
});

Statistics.create_and_register({
  id: 'orgCoreEstimates_gov_info', 
  table_deps: [ 'orgCoreEstimates'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.orgVoteStatEstimates;
    const q = table.q(subject);
    const dept_number = _.chain(table.depts)
      .keys()
      .filter(function(key){
        return table.q(key).sum("est_in_year_estimates") !== 0;
      })
      .value()
      .length;


    add("dept_number", dept_number);

    add('in_year_estimates_split', q.estimates_split({filter_zeros: true, as_tuple: true, col: in_year_col}) )
    add('last_year_estimates_split', q.estimates_split({filter_zeros: true, as_tuple: true, col: last_year_col}) )

    _.each(estimates_years, yr=> { add("tabled_"+yr, q.sum(yr+"_estimates")) } );
    
    add({
      "key": "voted_percent_est_in_year" ,
      "value": c.gov_voted_est_in_year/c.gov_tabled_est_in_year,
      "type": "percentage",
    });
    add({
      "key": "stat_percent_est_in_year" ,
      "value": c.gov_stat_est_in_year/c.gov_tabled_est_in_year,
      "type": "percentage",
    });

  },
});
