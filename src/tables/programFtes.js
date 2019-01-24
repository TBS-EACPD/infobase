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
    "GOCA",
    "PA",
    "FTE",
    "PROG",
    "ANNUAL",
    "PLANNED_EXP_TAG",
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
    })
    this.add_col({
      "key": true,
      "hidden": true,
      "type": "str",
      'nick': 'activity_code',
      "header": "",
    })
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
    })
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
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) )
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
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) )
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
          const prog = Program.lookup( Program.unique_id(row.dept, row.activity_code) )
          const goco = _.first(prog.tags_by_scheme.GOCO)
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
    const row = _.first(table.programs.get(subject))
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


    //const all_years_outcomes = _.chain( table.horizontal(years_exp,c.dept,true) )
    //                           .map(function(vals, key){ return [key].concat(vals);})
    //                           .value();
    //const all_years_spend_areas = _.chain( table.gov_goco(years_exp,c.dept,true) )
    //                            .map(function(vals, key){ return [key].concat(vals);})
    //                            .value();
    //var all_programs = q.sorted_programs(years_exp);
    //stats.year_over_year_multi_stats(add, "planed_exp_prgm", all_programs);
    //stats.year_over_year_multi_stats(add,"planned_exp_outcomes",all_years_outcomes);
    //stats.year_over_year_multi_stats(add,"planned_exp_spend_areas",all_years_spend_areas);
    //stats.add_all_years(add,"planned_exp",years_exp,function(year,i){ return  q.sum(year); });
    //
    //// FTE
    //var _add = add;
    //add = function(key,value){
    //  if (_.isString(key)){
    //    _add({ key : key, value : value, type : "big_int_real" });
    //  } else {
    //    _add(key);
    //  }
    //};
    //const all_years_outcomes_ftes = _.chain( table.horizontal(years_fte,c.dept,true) )
    //                           .map(function(vals, key){ return [key].concat(vals);})
    //                           .value();
    //const all_years_spend_areas_ftes = _.chain( table.gov_goco(years_fte,c.dept,true) )
    //                            .map(function(vals, key){ return [key].concat(vals);})
    //                            .value();
    //all_programs = q.sorted_programs(years_fte);
    //add("planned_fte_avg", d3.sum(q.sum(years_fte, {as_object: false}))/years_fte.length );
    //stats.year_over_year_multi_stats(add, "planed_fte_prgm", all_programs);
    //stats.year_over_year_multi_stats(add,"planned_fte_outcomes",all_years_outcomes_ftes);
    //stats.year_over_year_multi_stats(add,"planned_fte_spend_areas",all_years_spend_areas_ftes);
  },
});


Statistics.create_and_register({
  id: 'programFtes_tag_info', 
  table_deps: [ 'programFtes'],
  level: 'tag',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.programFtes;
    const q = table.q(subject);
    stats.add_all_years(add,"fte",std_years, (year,i) => q.sum(year));
    const hist_fte_avg = c.tag_fte_average;
    add("hist_fte_average", hist_fte_avg);

    stats.add_all_years(add,"fte",planning_years, (year,i) => q.sum(year) );
    const planned_fte_avg = c.tag_fte_average;
    add("planned_fte_average", planned_fte_avg);
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

    //const all_years_outcomes = (
    //  _.chain( table.goco_id(years_exp,false) )
    //    .map( (vals, goco_id) => {
    //      const stub = planned_spending_stubs_by_outcome[goco_id];
    //      return (
    //        stub ? 
    //        [
    //          goco_id,
    //          //vals: [ 1,2,3 ] , stub: [4,5,6] => [5,7,9]
    //          ...(_.chain(vals)
    //            .zip(stub)
    //            .map( ([old_vals, stub_vals]) => old_vals + stub_vals )
    //            .value()
    //          )
    //        ] : 
    //        [ goco_id, ...vals ]
    //      )
    //    }).value()
    //)
    //.concat([ 
    //  [
    //    crown_outcome_id, 
    //    ...( planned_spending_stubs_by_outcome[crown_outcome_id] )
    //  ]
    //]);

    //const all_years_spend_areas = (
    //  _.chain( all_years_outcomes )
    //    .map(arr => ({ goco_id: arr[0], vals: _.tail(arr) }) )
    //     //TODO we need a bilingual spendarea key to groupBy 
    //    .groupBy(({goco_id})=> Tag.lookup(goco_id).sub_type.replace(" ","") ) 
    //    .map( (group ,spend_area_key ) => [ 
    //      spend_area_key,  
    //      ...(
    //        _.zip.apply(null,_.pluck(group,'vals')) 
    //        .map(d => d3.sum(d))
    //      )
    //    ])
    //    .value()
    //);
      
    
    //stats.add_all_years(add,"",years_exp,function(year,i){ 
    //  return  q.sum(year) + planned_spending_stub_total[i]; 
    //});
    //stats.year_over_year_multi_stats(add,"planned_exp_outcomes",all_years_outcomes);
    //stats.year_over_year_multi_stats(add,"planned_exp_spend_areas",all_years_spend_areas);
    //const all_years_spend_areas_obj = (
    //  _.chain(all_years_spend_areas)
    //    .map(row => [_.head(row),_.tail(row)] )
    //    .object()
    //    .value()
    //);
    //const all_years_outcomes_obj = (
    //   _.chain(all_years_outcomes)
    //     .map(row => [_.head(row),_.tail(row)] )
    //    .object()
    //    .value()
    //);

    //add({key:'all_years_outcomes_obj',value:all_years_outcomes_obj});
    //add({key:'all_years_spend_areas_obj',value:all_years_spend_areas_obj});

    // FTE
    //var _add = add;
    //add = function(key,value){
    //  if (_.isString(key)){
    //    _add({ key : key, value : value, type : "big_int_real" });
    //  } else {
    //    _add(key);
    //  }
    //};
    //const all_years_outcomes_ftes = _.chain( table.horizontal(years_fte,false) )
    //                           .map(function(vals, key){ return [key].concat(vals);})
    //                           .value();
    //const all_years_spend_areas_ftes = _.chain( table.gov_goco(years_fte,false) )
    //                            .map(function(vals, key){ return [key].concat(vals);})
    //                            .value();
    //stats.add_all_years(add,"planned_fte",years_fte,function(year,i){
    //add("planned_fte_avg", d3.sum(q.sum(years_fte, {as_object: false}))/years_fte.length );
    //  return  q.sum(year);
    //});
    //stats.year_over_year_multi_stats(add,"planned_fte_outcomes",all_years_outcomes_ftes);
    //stats.year_over_year_multi_stats(add,"planned_fte_spend_areas",all_years_spend_areas_ftes);
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
    ) +"}}"

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


