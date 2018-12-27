import text from './programSpending.yaml';

// see [here](../table_definition.html) for description
// of the table spec
//const {spending_areas} = require('../../models/goco.js');

import { stats, Subject, trivial_text_maker, Statistics, years } from './table_common';

const { Program, Gov, Dept } = Subject;
const { std_years, planning_years} = years;
const exp_cols = _.map(std_years, yr=>yr+"exp");

export default {
  text,
  "id": "programSpending",
  subject_type: "program",
  source: [ "PA" , "DP", "DRR" ],
  "tags": [
    "GOV_FRAM",
    "PLANNED_EXP",
    "PA",
    "EXP",
    "AUTH",
    "PROG",
  ],


  "name": { "en": "Spending by Program",
    "fr": "Dépenses de programmes",
  },

  "title": { 
    "en": "Expenditures and Planned Spending by Program from {{pa_last_year_5}} to {{planning_year_3}} ($000)",
    "fr": "Dépenses réelles et prévues par programme de {{pa_last_year_5}} à {{planning_year_3}} (en milliers de dollars)",
  },


  "add_cols": function(){
    this.add_col({nick: "preamble","header": ""})
      .add_child([
        {
          "type": "int",
          "key": true,
          "hidden": true,
          "nick": "dept",
          "header": '',
        },{
          "key": true,
          "hidden": true,
          "type": "str",
          'nick': 'activity_code',
          "header": "",
        },
        {
          "key": true,
          "hidden": true,
          "type": "str",
          'nick': 'program_id',
          "header": "",
        },
        {
          "key": true,
          "type": "wide-str",
          'nick': 'prgm',
          "header": {
            "en": "Program",
            "fr": "Programme",
          },
        },
      ]);
    _.each(std_years, (header, ix)=>{
      //TODO: the col definitions here are copied from orgVoteStatPa, either change them or make it DRY 
      this.add_col(header)
        .add_child([
          {
            "type": "big_int",
            "simple_default": ix === 4,
            "nick": `${header}exp`,
            "header": {
              "en": "Expenditures",
              "fr": "Dépenses",
            },
            "description": {
              "en": `Corresponds to the funds spent against authorities available that year.`,
              "fr": `Correspondent aux dépenses effectuées aux termes de autorisations disponibles cette année-là.`,
            },
          },
        ]);
    });
    this.add_col({
      "type": "big_int",
      "nick": "drr_last_year",
      "hidden": true,
      "header": {
        "en": "{{pa_last_year}} - Planned Spending",
        "fr": "{{pa_last_year}} - Dépenses prévues",
      },
      "description": {
        "en": `Corresponds to total planned spending for the fiscal year {{pa_last_year}}, including additional funds approved by Treasury Board.`,
        "fr": `Correspondent au total des dépenses prévues pour l'exercice {{pa_last_year}}, y compris les fonds approuvés par le Conseil du Trésor.`,
      },
    });
    _.each(planning_years, (header) =>{
      this.add_col(header)
        .add_child([
          {
            "type": "big_int",
            "nick": header,
            "header": {
              "en": "Planned Spending",
              "fr": "Dépenses prévues",
            },
            "description": {
              "en": `Corresponds to total planned spending for the fiscal year ${header}, including additional funds approved by Treasury Board.`,
              "fr": `Correspondent au total des dépenses prévues pour l'exercice ${header}, y compris les fonds approuvés par le Conseil du Trésor.`,
            },
          },
          {
            "type": "big_int",
            "nick": `${header}_rev`,
            hidden: true,
          },
          {
            "type": "big_int",
            "nick": `${header}_spa`,
            hidden: true,
          },
          {
            "type": "big_int",
            "nick": `${header}_gross`,
            hidden: true,
          },
        ]);
    });

  },

  "dimensions": [
    {
      title_key: "gov_outcome",
      include_in_report_builder: true,

      filter_func: function(options){
        var func = function(row){
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) )
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
          //FIXME: this is because I found a program without a goco, 
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) )
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
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) )
          const goco = _.first(prog.tags_by_scheme.GOCO)
          return goco && goco.id;
        };
        return func;
      },
    },
  ],

  "sort": function (mapped_rows, lang) {
    return _.sortBy(mapped_rows, function (row) { return row.prgm;});
  },

  mapper: function (row) {
    const program = Program.get_from_activity_code(row[0], row[1]);
    row.splice(2,0,program.id);
    row.splice(3,0,program.name);
    return row;
  },

  process_mapped_row: function(mapped_row){
    const program_obj = Program.get_from_activity_code(mapped_row.dept, mapped_row.activity_code);
    this.programs.set(program_obj, [mapped_row]); //assumption: only one row per program... This is not consistent with e.g. programSobjs. 
  },

  "queries": {
    "sorted_programs": function(){
      return _.sortBy(this.data, function(x){
        return -x[_.last(std_years)+"exp"];
      });
    },
  },
};

Statistics.create_and_register({
  id: 'programSpending_dept_info', 
  table_deps: [ 'programSpending'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.programSpending;
    const q = table.q(subject);
    c.dept = subject;
    
    var last_year_prg_num = _.filter(q.data,function(d){ 
      const amt = d["{{pa_last_year}}exp"];
      return _.isNumber(amt) && amt !== 0;
    }).length;


    var last_year = q.get_top_x(["prgm","{{pa_last_year}}exp"],Infinity,{zip: true,sort_col: "{{pa_last_year}}exp"});
    var all_years = q.get_top_x(["prgm"].concat(exp_cols),Infinity,{zip: true});
    var all_years_spend_areas = (
      _.chain( table.gov_goco(exp_cols,c.dept,true) )
        .map(function(vals, key){ return [key].concat(vals);})
        .value()
    );
    stats.one_year_top3(add, "prg", last_year);
    stats.year_over_year_multi_stats(add,"prg_five_year",all_years);
    stats.year_over_year_multi_stats(add,"prgm_exp_spend_areas",all_years_spend_areas);
   
    add("prg_num",last_year_prg_num);

    stats.add_all_years(add,"exp",planning_years, (year,i) => q.sum(year) );
    const planned_exp_avg = c.dept_exp_average;
    add("planned_exp_average", planned_exp_avg);

    // Calculating CRSO numbers
    
    const crsos = subject.crsos

    const crso_num = subject.crsos
      .length

    add("crso_num",crso_num);

    const CRSO_data = _.map(crsos, crso => ({
      crso: crso,
      data: d3.sum(_.map(table.q(crso).data, prg => prg["{{planning_year_1}}"])),
    })
    )

    const max_crso = _.first(_.chain(CRSO_data)
      .sortBy("data")
      .reverse()
      .value())

    add("crso_max",max_crso);

  },
});

Statistics.create_and_register({
  id: 'programSpending_gov_info', 
  table_deps: [ 'programSpending'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {

    const table = tables.programSpending;
    const q = table.q(Gov);

    //var all_years_outcomes = _.map(table.horizontal(exp_cols,false),function(vals, key){ 
    //  return [key].concat(vals);
    //});
    //var all_years_spend_areas = _.map( table.gov_goco(exp_cols,false),function(vals, key){ 
    //  return [key].concat(vals);
    //});
    //stats.year_over_year_multi_stats(add,"prgm_exp_outcomes",all_years_outcomes);
    //stats.year_over_year_multi_stats(add,"prgm_exp_spend_areas",all_years_spend_areas);
    stats.add_all_years(add,"exp",planning_years, (year,i) => q.sum(year) );
    const planned_exp_avg = c.gov_exp_average;
    add("planned_exp_average", planned_exp_avg);
  },
});

Statistics.create_and_register({
  id: 'programSpending_program_info', 
  table_deps: [ 'programSpending', 'orgVoteStatPa'],
  info_deps: ['orgVoteStatPa_dept_info','programSpending_dept_info'],
  level: 'program',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.programSpending;
    const row = _.first(table.programs.get(subject));

    // Expenditure Calculations
    // Since average is ambiguous, we specified that the 
    // first average was for historical values
    // The second average was for planned values
    stats.add_all_years(add,"exp",std_years, (year,i) => row[year+"exp"] );
    add("dept_exp_pa_last_year",infos.orgVoteStatPa_dept_info.dept_exp_pa_last_year);
    add("pct_of_dept_exp_pa_last_year",c.program_exp_pa_last_year/infos.orgVoteStatPa_dept_info.dept_exp_pa_last_year);


    const five_yr_exp_avg = c.program_exp_average;
    add("hist_exp_average", five_yr_exp_avg);
    stats.add_all_years(add,"exp",planning_years, (year,i) => row[year] );
    add("pct_of_dept_exp_planning_year_1", c.program_exp_planning_year_1 / infos.programSpending_dept_info.dept_exp_planning_year_1);
    add("dept_exp_planning_year_1", infos.programSpending_dept_info.dept_exp_planning_year_1);

    //CRSO Calculations
    // add("crso_exp_planning_year_1", infos.programSpending_crso_info.crso_exp_planning_year_1);
    const crso = subject.crso

    add("crso", crso);

    const crso_exps = d3.sum(_.map(table.q(crso).data, prg => prg["{{planning_year_1}}"]))
    add("crso_exps", crso_exps);

    add("crso_exp_prg_share", c.program_exp_planning_year_1/crso_exps)

  },
});

Statistics.create_and_register({
  id: 'programSpending_tag_info', 
  table_deps: [ 'programSpending'],
  level: 'tag',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.programSpending;
    const q = table.q(subject);
    var all_years = q.get_top_x(["prgm"].concat(exp_cols),Infinity,{zip: true});

    var last_year_prg_num = _.filter(q.data,function(d){ 
      const amt = d["{{pa_last_year}}exp"];
      return _.isNumber(amt) && amt !== 0;
    }).length;

    var last_year = _.map(
      q.get_top_x(["dept","activity_code","{{pa_last_year}}exp"],Infinity,{zip: true,sort_col: "{{pa_last_year}}exp"}),
      ([ org_id, ac, val]) => [ `${Dept.lookup(org_id).sexy_name} - ${Program.get_from_activity_code(org_id, ac).name}`, val]
    )
    stats.one_year_top3(add, "prg", last_year);
    
    stats.add_all_years(add,"exp", std_years, (year,i) => q.sum(year+"exp"));
    const five_yr_exp_avg = c.tag_exp_average;
    add("hist_exp_average", five_yr_exp_avg);

    stats.add_all_years(add,"exp",planning_years, (year,i) => q.sum(year) );
    add("prg_num",last_year_prg_num);

    stats.year_over_year_multi_stats(add,"prg_five_year",all_years);

  },
});

Statistics.create_and_register({
  id: 'programSpending_crso_info', 
  table_deps: [ 'programSpending'],
  level: 'crso',
  compute: (subject, tables, infos, add, c) => {

    const table = tables.programSpending;
    const q = table.q(subject);

    var first_year_prg_num = _.filter(q.data,function(d){ 
      return d[_.first(planning_years)] !== 0;
    }).length;

    add("exp_prg_num",first_year_prg_num);
    
    const min_planning_yr = "{{planning_year_" + _.min(
      _.map(planning_years, yr => Number(yr.match(/\d+/)))
    ) +"}}"

    const sorted_first_yr = q.get_top_x(["prgm",min_planning_yr],Infinity,{zip: true,sort_col: min_planning_yr});

    stats.one_year_top3(add, "exp_prg", sorted_first_yr);

    stats.add_all_years(add,"exp", std_years, (year,i) => q.sum(year+"exp"));

    const five_yr_exp_avg = c.crso_exp_average;
    add("hist_exp_average", five_yr_exp_avg);

    stats.add_all_years(add,"exp", planning_years, (year,i) => q.sum(year)); 
    add("planned_exp_average", c.crso_exp_average);
    add("planned_exp_total", c.crso_exp_total);

    const programSpending_data = q.data

    const data = _.map(programSpending_data,
      d => ({ 
        value: d["{{planning_year_1}}"],
        label: d.prgm,
        id: d.activity_code,
        link: Program.lookup(Program.unique_id(d.dept, d.activity_code)).link_to_infographic,
      })
    )
    add("program_list", data);
    
    add("parent", subject.dept.name);

  },
});






