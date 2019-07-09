import text from './programFtes.yaml';

// see [here](../table_definition.html) for description
// of the table spec
//


import { stats, Subject, trivial_text_maker, m, Statistics, years } from './table_common';

const { std_years, planning_years } = years;
const { Program, Gov } = Subject;

export default {
  text,
  id: "programFtes",
  legacy_id: "table12",
  subject_type: "program",
  source: [ "DP", "DRR" ],
  //"tags" : ["results", "expenditures", "FTE", "planning","report","RPP"],
  "tags": [
    "GOCO",
    "PA",
    "FTE",
    "PROG",
    "ANNUAL",
    "PLANNED_EXP",
    "DP",
    "DRR",
  ],

  "name": { "en": "Full-Time Equivalents (FTEs) by Program",
    "fr": "Équivalents temps plein (ETP) par programme",
  },

  "title": { "en": "Actual and Planned Full-Time Equivalents (FTEs) by Program from {{pa_last_year_5}} to {{planning_year_3}}",
    "fr": "Équivalents temps plein (ETP) actuels et prévus par programme de {{pa_last_year_5}} à {{planning_year_3}}",
  },

  "footnote-topics": {
    "group": ["planned_spending"],
    "table": ["~planned_spending","planned_spending_gov"],
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
      "hidden": true,
      "type": "str",
      'nick': 'activity_code',
      "header": "",
    });
    this.add_col({
      "key": true,
      "hidden": true,
      "type": "str",
      'nick': 'program_id',
      "header": "",
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
    _.each(std_years, (header, ix) => {
      this.add_col(
        { "type": "big_int_real",
          "simple_default": ix===4,
          "nick": header,
          "header": {
            "en": header + "  " + m("Actual FTEs"),
            "fr": header + "  " + m("ETP réel"),
          },
          "description": {
            "en": `Corresponds to the total number of actual FTEs for the fiscal year ${header}`,
            "fr": `Correspond au nombre total d'équivalents temps plein (ETP) réel pour l'exercice ${header}`,
          },
        });
    });

    this.add_col({ 
      "type": "big_int_real",
      "nick": "drr_last_year" ,
      "hidden": true,
      "header": {
        "en": "{{pa_last_year}}  "+ m("Planned FTEs"),
        "fr": "{{pa_last_year}}  "+ m("ETP prévus"),
      },
      "description": {
        "en": `Corresponds to the total number of planned FTEs for the fiscal year {{pa_last_year}}`,
        "fr": `Correspond au nombre total d'équivalents temps plein (ETP) prévus pour l'exercice {{pa_last_year}}`,
      },
    });
    _.each(planning_years, (header)=>{
      this.add_col({ 
        "type": "big_int_real",
        "nick": header,
        "header": {
          "en": header + "  " + m("Planned FTEs"),
          "fr": header + "  " + m("ETP prévus"),
        },
        "description": {
          "en": `Corresponds to the total number of planned FTEs for the fiscal year ${header}`,
          "fr": `Correspond au nombre total d'équivalents temps plein (ETP) prévus pour l'exercice ${header}`,
        },
      });
    });

  },

  "dimensions": [
    {
      title_key: "gov_outcome",
      include_in_report_builder: true,

      filter_func: function(options){
        var func = function(row){
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) );
          //FIXME: this is because I found a program without a goco, 
          const goco = _.get(prog, "tags_by_scheme.GOCO[0].name");
          return goco || trivial_text_maker('unknown');
        };
        return func;
      },
    },
    {
      title_key: "gov_goco",
      include_in_report_builder: true,

      filter_func: function(options){
        var func = function(row){
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) );
          //FIXME: this is because I found a program without a goco, 
          const sa = _.get(prog, "tags_by_scheme.GOCO[0].parent_tag.name");
          return sa || trivial_text_maker('unknown');
        };
        return func;
      },
    },
    {
      title_key: 'goco_id',
      filter_func: function(options){
        var func = function(row){
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) );
          const goco = _.first(prog.tags_by_scheme.GOCO);
          return goco && goco.id;
        };
        return func;
      },
    },
  ],

  "sort": function(mapped_rows, lang){
    return _.sortBy(mapped_rows, function(row){
      return [row.goco_gov, row.goco];
    });
  },

  "mapper": function (row) {
    const program = Program.get_from_activity_code(row[0], row[1]);
    row.splice(2,0,program.id);
    row.splice(3,0,program.name);
    return row;
  },

  process_mapped_row(mapped_row){
    const program_obj = Program.get_from_activity_code(mapped_row.dept, mapped_row.activity_code);
    this.programs.set(program_obj, [mapped_row]); //assumption: only one row per program... This is not consistent with e.g. programSobjs. 
  },

  "queries": {
    "sorted_programs": function(yrs){
      return _.chain(this.data)
        .map(function(d){
          return [d.prgm].concat(_.map(yrs,function(x){ return d[x];}));
        })
        .sortBy( function(x){
          return -d3.sum(_.tail(x));
        })
        .value();
    },
  },
};

Statistics.create_and_register({
  id: 'programFtes_program_info', 
  table_deps: [ 'programFtes'],
  level: 'program',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.programFtes;
    const row = _.first(table.programs.get(subject));
    stats.add_all_years(add,"fte",std_years, (year,i) => row[year] );
    stats.add_all_years(add,"fte",planning_years, (year,i) => row[year] );
  },
});

Statistics.create_and_register({
  id: 'programFtes_dept_info', 
  table_deps: [ 'programFtes'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.programFtes;
    const q = table.q(subject);
    c.dept = subject;
    stats.add_all_years(add,"fte",planning_years, (year,i) => q.sum(year) );
    const planned_fte_avg = c.dept_fte_average;
    add("planned_fte_average", planned_fte_avg);

    stats.add_all_years(add,"fte",std_years, (year,i) => q.sum(year) );
    const hist_fte_avg = c.dept_fte_average;
    add("hist_fte_average", hist_fte_avg);
  },
});

Statistics.create_and_register({
  id: 'programFtes_gov_info', 
  table_deps: [ 'programFtes'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.programFtes;
    const q = table.q(Gov);
    
    stats.add_all_years(add,"fte",planning_years, (year,i) => q.sum(year) );
    const planned_fte_average = c.gov_fte_average;
    add("planned_fte_average", planned_fte_average);

    stats.add_all_years(add,"fte",std_years, (year,i) => q.sum(year) );
    const hist_fte_avg = c.gov_fte_average;
    add("hist_fte_average", hist_fte_avg);
  },
});

Statistics.create_and_register({
  id: 'programFtes_crso_info', 
  table_deps: [ 'programFtes'],
  level: 'crso',
  compute: (subject, tables, infos, add, c) => {
    const programFtes = tables.programFtes;
    const q = programFtes.q(subject);

    var first_year_prg_num = _.filter(q.data,function(d){ 
      return d[_.first(planning_years)] !== 0;
    }).length;

    add("fte_prg_num",first_year_prg_num);

    const min_planning_yr = "{{planning_year_" + _.min(
      _.map(planning_years, XX => Number(XX.match(/\d+/)))
    ) +"}}";

    const sorted_first_yr = q.get_top_x(
      ["prgm", min_planning_yr],
      Infinity, 
      {zip: true, sort_col: min_planning_yr}
    );

    stats.one_year_top3(add, "fte_prg", sorted_first_yr);

    stats.add_all_years(add,"fte", std_years, (year,i) => q.sum(year));

    stats.add_all_years(add,"fte", planning_years, (year,i) => q.sum(year)); 
    add("planned_fte_average", c.crso_fte_average);

  },
});


