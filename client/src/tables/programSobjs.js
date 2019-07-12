
//require("../../panels/spend_by_so_hist"); //we arent showing this stuff.

import text from './programSobjs.yaml';

// see [here](../table_definition.html) for description
// of the table spec
import { 
  trivial_text_maker, 
  years, 
  businessConstants,
  Statistics, 
  rows_to_rev_split,
  collapse_by_so,
  is_non_revenue,
} from './table_common';
import { Subject } from '../models/subject';

const { Program } = Subject;
const { std_years } = years;
const { sos } = businessConstants;

export default {
  text,
  id: "programSobjs",
  legacy_id: "table305",
  subject_type: "program",
  source: [ "CFMRS" ],
  "tags": [ 
    "PA",
    "SOBJ",
    "EXP",
    "PROG",
    "ANNUAL",
    "GOCO",
  ],
  "name": { 
    "en": "Program Expenditures by Standard Object",
    "fr": "Dépenses de programmes par article courant",
  },
  "title": { 
    "en": "Program Expenditures by Standard Object {{pa_last_year}} ($000)",
    "fr": "Dépenses de programmes par article courant {{pa_last_year}} (en milliers de dollars)",
  },
  add_cols () {
    this.add_col( {
      "type": "int",
      "key": true,
      "hidden": true,
      "nick": "dept",
      "header": '',
    });
    this.add_col({
      "type": "string",
      "key": true,
      "hidden": true,
      "nick": "activity_code",
    });
    this.add_col({
      "key": true,
      "type": "wide-str",
      'nick': 'prgm',
      "header": {
        "en": "Program",
        "fr": "Programme",
      },
    });
    this.add_col( {
      "key": true,
      "type": "int",
      "hidden": true,
      "nick": 'so_num',
    });
    this.add_col( {
      "key": true,
      "type": "str",
      "nick": 'so',
      "header": {
        "en": "Standard Object",
        "fr": "Article courant",
      },
    });
    const years = _.takeRight(std_years, 3);
    years.forEach(yr=> {
      this.add_col({ 
        "type": "big_int",
        "nick": yr,
        "simple_default": true,
        "header": yr,
        "description": {
          "en": "Corresponds to the funds spent by standard object during the fiscal year " + yr,
          "fr": "Correspond aux dépenses effectuées par article courant durant l'exercice financier " + yr,
        },
      });
    });
  },
  sort (rows, lang) {  
    return _.sortBy(rows, row => row.so_num);
  },
  mapper (row) {
    const program = Program.get_from_activity_code(row[0], row[1]);
    row.splice(2,0,program.name);
    row.splice(4,0, sos[row[3]].text);
    return row;
  },
  process_mapped_row (mapped_row){
    const program_obj = Program.get_from_activity_code(mapped_row.dept, mapped_row.activity_code);
    if(!this.programs.get(program_obj)){ 
      this.programs.set(program_obj, []); 
    }
    this.programs.get(program_obj).push(mapped_row); 
  },
  "dimensions": [
    {
      title_key: "so",
      include_in_report_builder: false,

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
      title_key: "gov_outcome",
      include_in_report_builder: true,

      filter_func: function(options){
        var func = function(row){
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) );
          const goco = prog.tags_by_scheme.GOCO && prog.tags_by_scheme.GOCO[0];
          return (goco && goco.name) || trivial_text_maker('unknown');
        };
        return func;
      },
    },
    {
      title_key: "gov_goco",
      include_in_report_builder: true,

      filter_func: function(options){
        var func = function(row){
          //FIXME: this is because I found a program without a goco, 
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) );
          const goco = prog.tags_by_scheme.GOCO && prog.tags_by_scheme.GOCO[0];
          return (goco && goco.parent_tag.name) || trivial_text_maker('unknown');
        };
        return func;
      },
    },
  ],
};




Statistics.create_and_register({
  id: 'tag_revenue', 
  table_deps: [ 'programSobjs'],
  level: 'tag',
  compute: (subject, tables, infos, add, c) => {
    const {programSobjs} = tables;
    const prog_rows = programSobjs.q(subject).data;
    const exp_rev_results = rows_to_rev_split(prog_rows);

    add({
      key: "exp_rev_gross", 
      value: exp_rev_results.gross_exp,
    });

    add({
      key: "exp_rev_neg", 
      value: exp_rev_results.neg_exp,
    });

    add({
      key: "exp_rev_neg_minus", 
      value: -exp_rev_results.neg_exp,
    });

    add({
      key: "exp_rev_net", 
      value: exp_rev_results.net_exp,
    });

  },

});

Statistics.create_and_register({
  id: 'program_revenue', 
  table_deps: [ 'programSobjs'],
  level: 'program',
  compute: (subject, tables, infos, add, c) => {
    const programSobjs = tables.programSobjs;
    const prog_rows = programSobjs.programs.get(subject);
    const exp_rev_results = rows_to_rev_split(prog_rows);

    add({
      key: "exp_rev_gross", 
      value: exp_rev_results.gross_exp,
    });

    add({
      key: "exp_rev_neg", 
      value: exp_rev_results.neg_exp,
    });

    add({
      key: "exp_rev_neg_minus", 
      value: -exp_rev_results.neg_exp,
    });

    add({
      key: "exp_rev_net", 
      value: exp_rev_results.net_exp,
    });

  },

});


Statistics.create_and_register({
  id: 'program_std_obj', 
  table_deps: ['programSobjs'],
  level: 'program',
  compute: (subject, tables, infos, add, c) => {
    const {programSobjs} = tables;

    const rows_by_so = collapse_by_so([subject], programSobjs, is_non_revenue);

    if (_.isEmpty(rows_by_so)){
      return false;
    }
    
    const { 
      label: top_so_name, 
      value: top_so_amount,
    } = _.first(rows_by_so);

    const total_spent = d3.sum( rows_by_so, _.property('value') );
    const top_so_pct = top_so_amount/total_spent;

    add("top_so_name", top_so_name);
    add("total_spent", total_spent);
    add("top_so_spent", top_so_amount);
    add("top_so_pct", top_so_pct);
  },
});

Statistics.create_and_register({
  id: 'tag_std_obj', 
  table_deps: ['programSobjs'],
  level: 'tag',
  compute: (subject, tables, infos, add, c) => {
    const {programSobjs} = tables;

    const rows_by_so = collapse_by_so(subject.programs, programSobjs, is_non_revenue);
    const { 
      label: top_so_name, 
      value: top_so_amount,
    } = _.first(rows_by_so);

    const total_spent = d3.sum(rows_by_so, _.property('value'));

    const top_so_pct = top_so_amount/total_spent;

    add("top_so_name", top_so_name);
    add("total_spent", total_spent);
    add("top_so_spent", top_so_amount);
    add("top_so_pct", top_so_pct);
  },
});
