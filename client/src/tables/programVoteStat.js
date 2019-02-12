import text from './programVoteStat.yaml';

// see [here](../table_definition.html) for description
// of the table spec
import { Subject, trivial_text_maker, Statistics, years } from './table_common';

const { Program } = Subject;
const { std_years } = years;

export default {
  text,
  id: "programVoteStat",
  legacy_id: "table300",
  subject_type: "program",
  tags: [
    "PROG",
    "PA",
    "EXP",
    "VOTED",
    "STAT",
    "ANNUAL",
  ],
  source: [ "CFMRS" ],
  name: { 
    en: "Program Expenditures by Authority Type",
    fr: "Dépenses de programme par type d'autorisation",
  },
  title: { 
    en: "Program Expenditures by Authority Type {{pa_last_year}} ($000)",
    fr: "Dépenses de programme par type d'autorisation {{last_year}} (en milliers de dollars)",
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
      "nick": 'activity_code',
      "header": "",
    });
    this.add_col( {
      "key": true,
      "type": "str",
      "nick": 'prgm',
      "header": {
        "en": "Program",
        "fr": "Program",
      },
    });
    this.add_col( {
      "key": true,
      "type": "str",
      "nick": 'vote_stat',
      "header": {
        "en": "Voted / Stat",
        "fr": "Crédit / législatif",
      },
    });
    const years = _.takeRight(std_years, 3);
    years.forEach(yr=> {
      this.add_col({
        "type": "big_int",
        "simple_default": true,
        "nick": yr,
        "header": yr,
        "description": {
          "en": "Corresponds to the funds spent against authorities available for the fiscal year " + yr,
          "fr": "Correspond aux dépenses effectuées par rapport aux autorisations disponibles durant l'exercice financier " + yr,
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
    const program = Program.get_from_activity_code(row[0], row[1]);
    row.splice(2,0,program.name);
    row[3] = row[3] === "V" ? trivial_text_maker("voted") : trivial_text_maker("stat");
    return row;
  },
  process_mapped_row(mapped_row){
    const program_obj = Program.get_from_activity_code(mapped_row.dept, mapped_row.activity_code);
    if(!this.programs.get(program_obj)){ 
      this.programs.set(program_obj, []) 
    }
    this.programs.get(program_obj).push(mapped_row); 
  },
  "dimensions": [
    {
      title_key: "voted_stat",
      include_in_report_builder: true,
      filter_func: () => _.property('vote_stat'),
    },
    {
      title_key: "gov_outcome",
      include_in_report_builder: true,

      filter_func: function(options){
        var func = function(row){
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) )
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
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) )

          const goco = prog.tags_by_scheme.GOCO && prog.tags_by_scheme.GOCO[0];
          return (goco && goco.parent_tag.name) || trivial_text_maker('unknown');
        };
        return func;
      },
    },
  ],
};


Statistics.create_and_register({
  id: 'programVoteStat_program_info', 
  table_deps: [ 'programVoteStat'],
  level: 'program',
  compute: (subject, table_deps, info_deps, add, c) => {
    const type_col = "vote_stat";
    const {programVoteStat} = table_deps;
    const last_year_col = _.last(std_years);
    const rows = programVoteStat.programs.get(subject);
    const { 
      [trivial_text_maker("voted")]: voted_rows,
      [trivial_text_maker("stat")]: stat_rows,
    } = _.groupBy(rows, type_col);
   
    const voted_amount = _.first(voted_rows) && _.first(voted_rows)[ last_year_col ] || 0;
    const stat_amount = _.first(stat_rows) && _.first(stat_rows)[ last_year_col ] || 0;
    const total = voted_amount + stat_amount;
    const voted_pct = voted_amount/total;
    const stat_pct = stat_amount/total;

    add("voted_exp", voted_amount);
    add("stat_exp", stat_amount);
    add("voted_pct", voted_pct);
    add("stat_pct", stat_pct);
    add("total_exp", total);

  },
})


Statistics.create_and_register({
  id: 'programVoteStat_tag_info', 
  table_deps: [ 'programVoteStat'],
  level: 'tag',
  compute: (subject, table_deps, info_deps, add, c) => {
    const type_col = "vote_stat";
    const {programVoteStat} = table_deps;
    const last_year_col = _.last(std_years);
    const last_year_col_obj = programVoteStat.col_from_nick(last_year_col);
    const rows = programVoteStat.q(subject).data;

    const { 
      [trivial_text_maker("voted")]: voted_rows,
      [trivial_text_maker("stat")]: stat_rows,
    } = _.groupBy(rows, type_col);
   
    const voted_amount = last_year_col_obj.formula(voted_rows);
    const stat_amount = last_year_col_obj.formula(stat_rows);
    const total = voted_amount + stat_amount;
    const voted_pct = voted_amount/total;
    const stat_pct = stat_amount/total;

    add("voted_exp", voted_amount);
    add("stat_exp", stat_amount);
    add("voted_pct", voted_pct);
    add("stat_pct", stat_pct);
    add("total_exp", total);

  },
})
