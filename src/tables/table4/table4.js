// see [here](../table_definition.html) for description
// of the table spec
import text from './table4.yaml';

import { stats, vote_stat_dimension, major_vote_stat, m, Statistics, years} from '../table_common';
import { trivial_text_maker } from '../../models/text.js';

const { std_years } = years;
const voted_label = trivial_text_maker("voted")
const stat_label = trivial_text_maker("stat")

export default {
  text,
  "id": "table4",

  "tags" : [
    "PA",
    "AUTH",
    "EXP",
    "VOTED",
    "STAT",
  ],

  source: [ "PA" ],
  "name": { 
    en: "Authorities and Expenditures",
    fr: "Autorisations et dépenses",
  },

  "title": { "en": "Authorities and Actual Expenditures from {{pa_last_year_5}} to {{pa_last_year}} ($000)",
    "fr": "Autorisations et dépenses réelles {{pa_last_year_5}} à {{pa_last_year}} (en milliers de dollars)",
  },


  "add_cols": function(){
    this.add_col({
      "header":{
        "en":"Vote {{pa_last_year}} / Statutory",
        "fr":"Crédit {{pa_last_year}} / Poste législatif",
      }})
      .add_child([
        {
          "type":"int",
          "key" : true,
          "hidden" : true,
          "nick" : "dept",
          "header":'',
        },
        {
          "type":"int",
          "key" : true,
          "hidden":true,
          "nick" : "votenum",
          "header":{
            "en":"Number",
            "fr":"Numéro",
          },
        },
        {
          "type":"int",
          "key" : true,
          "hidden" : true,
          "nick" : "votestattype",
          "header":'',
        },
        {
          "type":"wide-str",
          "key" : true,
          "nick" : "desc",
          "header":{
            "en":"Description",
            "fr":"Description",
          },
        },
      ]);
    _.each(std_years, (header,i)=>{
      this.add_col(header)
        .add_child([
          {
            "type": "big_int",
            "nick": header + "auth",
            "header": {
              "en": "Total budgetary authority available for use",
              "fr": "Autorisations budgétaires disponibles pour l'emploi",
            },
            "description": {
              "en": "Corresponds to the authorities provided by Parliament, including transfers from other organizations or adjustments that are made during the year.",
              "fr": "Correspondent aux autorisations accordées par le Parlement, y compris les transferts provenant d’autres organisations ou les rajustements qui ont été effectués au cours de l’exercice.",
            },
          },{
            "simple_default": i === 4,
            "type": "big_int",
            "nick": header + "exp",
            "header": {
              "en": "Expenditures",
              "fr": "Dépenses",
            },
            "description": {
              "en": "Corresponds to the funds spent against authorities available that year.",
              "fr": "Correspondent aux dépenses effectuées aux termes de autorisations disponibles cette année-là.",
            },
          },
        ]);
    });
  },

  "queries" : {
    "exp_auth_by_year" : function(year,format){
      format = format === undefined ? false : true;
      var vals = this.sum([year+'auth',year+'exp'],{format: format});
      return [m(year),vals[year+'auth'],vals[year+'exp']];
    },
    "voted_items" : function(cut_off){
      this.vote_stat_query = vote_stat_query;
      return this.vote_stat_query(voted_label,cut_off);
    },
    "stat_items" : function(cut_off){
      this.vote_stat_query = vote_stat_query;
      return this.vote_stat_query(stat_label,cut_off);
    },
  },

  "dimensions" : [
    {
      title_key : "major_voted_stat",
      include_in_report_builder : true,
      filter_func : major_vote_stat,
    },
    {
      title_key :"voted_stat",
      include_in_report_builder : true,
      filter_func : vote_stat_dimension,
    },
  ],

  "sort": function (mapped_rows, lang) {
    var grps = _.groupBy(mapped_rows, function (row) { 
      return _.isNumber(row.votenum);
    });
      // grps[true]  ==> voted rows
      // grps[false] ==> stat rows
    if (_.has(grps, false)) {
      grps[false] = _.sortBy(grps[false], function (row) { return row[0]; });
    } else {
      grps[false] = [];
    }
    if (_.has(grps, true)) {
      grps[true] = _.sortBy(grps[true], function (row) { 
        return row.votenum; 
      });
    } else {
      grps[true] = [];
    }
    return grps[true].concat(grps[false]);
  },

  mapper: function (row) {
    if (this.lang === 'en') {
      row.splice(4, 1);
    } else {
      row.splice(3, 1);
    }
    if (+row[2] !== 999 && row[0] !== 'ZGOC'){
      row[3] = row[3] + " - " + row[1];
    }
    return row;
  },
};


const vote_stat_query = function(vote_or_stat, cut_off){
  var total=0;
  var cut_off_counter=0;
  var dept = this.dept || true;

  return _.chain(this.table.voted_stat(undefined,dept, false)[vote_or_stat])
    .map(_.clone)
    .flatten()
    .sortBy(function(d){
      d.total = d3.sum(_.map(std_years, function(year){return d[year+"auth"];}));
      total += d.total;
      return -d.total;
    })
    .each(function(d){
      d.percent = d.total / total;
    })
    .each(function(d){
      if (!cut_off){return;}
      cut_off_counter += d.percent;
      d.cut_off = cut_off_counter >= cut_off ? true : false;
    })
    .value();
};



Statistics.create_and_register({
  id: 'table4_dept_info', 
  table_deps: [ 'table4'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table4;
    const q = table.q(subject);

    c.dept = subject;

    stats.year_over_year_single_stats(add, 
      "voted_five_year_auth", 
      _.map(std_years,m),
      _.chain(std_years)
        .map(function(year){ return table.voted_stat(year+'auth',subject)[voted_label];})
        .value()
    );
    stats.year_over_year_single_stats(add, 
      "stat_five_year_auth", 
      _.map(std_years,m),
      _.chain(std_years)
        .map(function(year){ return table.voted_stat(year+'auth',subject)[stat_label];})
        .value()
    );
    stats.year_over_year_single_stats(add, 
      "five_year_auth", 
      _.map(std_years,m),
      _.chain(std_years)
        .map(function(year){ return q.sum([year+"auth"]);})
        .value()
    );


    const unused_auth_diff = _.map(
      std_years,
      year => _.map(q.data, row => (row[year + "auth"] - row[year + "exp"]) ) 
    );

    const unused_auth_sum = _.map(unused_auth_diff,d => d3.sum(d) );

    const unused_auth_avg = d3.sum(unused_auth_sum)/ unused_auth_sum.length

    add({
      key : "hist_diff_average", 
      value : unused_auth_avg,
    });

    add({
      key : "hist_avg_tot_pct", 
      value : (c.dept_hist_diff_average / c.dept_five_year_auth_average),
    });

    stats.year_over_year_single_stats(add, 
      "five_year_exp", 
      _.map(std_years,m),
      _.chain(std_years)
        .map(function(year){ return q.sum([year+"exp"]);})
        .value()
    );


    stats.add_all_years(add,"auth",std_years,function(year,i){
      return q.sum(year+"auth");
    });

    stats.add_all_years(add,"exp",std_years,function(year,i){
      return q.sum(year+"exp");
    });

    stats.add_all_years(add,"voted",std_years,function(year,i){
      return table.voted_stat(year+'auth',subject)[voted_label];
    });

    stats.add_all_years(add,"stat",std_years,function(year,i){
      return table.voted_stat(year+'auth',subject)[stat_label];
    });

    add({
      key : "stat_five_year_pct", 
      value : c.dept_stat_total / (c.dept_stat_total+c.dept_voted_total),
      type : "percentage1",
    });
    add({
      key : "voted_five_year_pct", 
      value : c.dept_voted_total / (c.dept_stat_total+c.dept_voted_total),
      type : "percentage1",
    });
  },
});


Statistics.create_and_register({
  id: 'table4_gov_info', 
  table_deps: [ 'table4'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table4;
    const q = table.q(subject);

    stats.year_over_year_single_stats(
      add, 
      "five_year_auth", 
      _.map(std_years,m),
      _.chain(std_years)
        .map(function(year){ return q.sum([year+"auth"]);})
        .value()
    );

    stats.year_over_year_single_stats(add, 
      "five_year_exp", 
      _.map(std_years,m),
      _.chain(std_years)
        .map(function(year){ return q.sum([year+"exp"]);})
        .value()
    );
    stats.year_over_year_single_stats(add, 
      "five_year_unused_auth", 
      _.map(std_years,m),
      _.chain(std_years)
        .map(function(year){ 
          return q.sum([year+"auth"]) - q.sum([year+"exp"]) ;
        })
        .value()
    );

    stats.add_all_years(add,"auth",std_years,function(year,i){
      return q.sum(year+"auth");
    });
    stats.add_all_years(add,"exp",std_years,function(year,i){
      return q.sum(year+"exp");
    });
    
    add("hist_diff_average", c.gov_auth_average - c.gov_exp_average);
    add("hist_avg_tot_pct", c.gov_hist_diff_average / c.gov_auth_average);

    stats.add_all_years(add,"voted",std_years,function(year,i){
      return table.voted_stat(year+'auth',false)[voted_label];
    });
    stats.add_all_years(add,"stat",std_years,function(year,i){
      return table.voted_stat(year+'auth',false)[stat_label];
    });


    add("stat_five_year_pct", c.gov_stat_total / (c.gov_stat_total+c.gov_voted_total)); //type percentage
    add("voted_five_year_pct", c.gov_voted_total / (c.gov_stat_total+c.gov_voted_total)) //type : "percentage"
  },
});

