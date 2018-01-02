exports = module.exports;
// see [here](../table_definition.html) for description
// of the table spec
require("./table7.ib.yaml");
require("../../graphs/last_year_g_and_c_perspective");
require("../../graphs/historical_g_and_c");

const {
  STATS, 
  text_maker, 
  Statistics, 
  years : {std_years},
} = require("../table_common");

module.exports = {
  "id": "table7",

  "tags" : [
    "AUTH",
    "EXP",
    "PA",
    "VOTED",
    "STAT",
    "SOBJ10",
  ],

  source: [ "PA" ],
  "name": {
    "en": "Transfer Payments",
    "fr": "Paiements de transfert",
  },

  "title": {
    "en": "Transfer Payments from {{pa_last_year_5}} to {{pa_last_year}} ($000)",
    "fr": "Paiements de transfert de {{pa_last_year_5}} à {{pa_last_year}} (en milliers de dollars)",
  },

  "add_cols" :function(){
    this.add_col({
      "header": {
        "en":"Transfer Payment",
        "fr":"Paiement de transfert",
      },
    })
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
          "nick" : "type",
          "header":{
            "en":"Type",
            "fr":"Type",
          },
        },
        {
          "type":"wide-str",
          "key" : true,
          "nick" : 'tp',
          "header":{
            "en":"Name",
            "fr":"Nom",
          },
        },
      ]);
    _.each(std_years, (header,i)=>{
      this.add_col(header).add_child(
        [
          {
            "type":"big_int",
            "nick" : header+'auth',
            "header":{
              "en":"Total budgetary authority available for use",
              "fr":"Autorisations budgétaires disponibles pour l'emploi",
            },
            "description": {
              "en": "Corresponds to the authorities provided by Parliament, including transfers from other organizations or adjustments that are made during the year.",
              "fr": "Correspondent aux autorisations accordées par le Parlement, y compris les transferts provenant d'autres organismes ou les rajustements qui ont été effectués au cours de l'exercice.",
            },
          },
          {
            "type":"big_int",
            "simple_default": i===4,
            "nick" : header+'exp',
            "header":{
              "en":"Expenditures",
              "fr":"Dépenses",
            },
            "description": {
              "en": "Corresponds to the funds spent against authorities available that year.",
              "fr": "Correspondent aux dépenses par rapport aux autorisations disponibles cette année-là.",
            },
          },
        ]
      );
    });
  },

  "dimensions" : [
    {
      title_key : "payment_types_v_s",
      include_in_report_builder : true,

      filter_func :  function(options){
        return function(row){
          var type = row.type;
          if (row.tp.substring(0,3) === '(S)' || row.tp.substring(0,3) === "(L)"){
            return type + ' - ' + text_maker("stat");
          } else {
            return type + ' - ' + text_maker("voted");
          }
        };
      },
    },
    {
      title_key :"payment_types",
      include_in_report_builder : true,

      filter_func : function(options){
        return function(row){
          return row.type;
        };               
      },
    },
  ],

  "queries": {
    "types" : function(){
      return _.uniqBy(this.get_cols(["type"]).type);
    },
  },

  "sort": function (mapped_rows, lang) {
    return _.sortBy(mapped_rows, function (row) { return [row.type, row.tp];});
  },

  "mapper": function (row) {
    if (this.lang === 'en') {
      row.splice(2, 1);
      row.splice(3, 1);
    } else {
      row.splice(1, 1);
      row.splice(2, 1);
    }
    // remove acronym and vote type
    return row;
  },
};

Statistics.create_and_register({
  id: 'table7_gov_info', 
  table_deps: [ 'table7'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.table7;
    const q = table.q(subject);
    var cols =  _.map(std_years, function(year){  return year+"exp"; });
    var all_years = q.get_cols(["tp"].concat(cols),{zip:true});
    STATS.year_over_year_multi_stats(add, "tp_exp",all_years);
    var all_years_type = _.chain(q.types()) 
      .map(function(type){
        return _.chain(std_years)
          .map( function(year,i){
            var val = table.payment_types(year+"exp",false)[type];
            if (i === 0){
              return [type, val];
            } else {
              return val;
            }
          })
          .flatten()
          .value();
      })
      .value();

    STATS.year_over_year_multi_stats(add, "tp_type_exp",all_years_type);
    STATS.add_all_years(
      add,
      "tp_exp",
      std_years,
      year => q.sum(year+"exp")
    );
  },
});


Statistics.create_and_register({
  id: 'table7_dept_info', 
  table_deps: [ 'table7'],
  info_deps: ['table7_gov_info', 'table4_dept_info'],
  level: 'dept',
  compute: (subject, table_deps, info_deps, add, c) => {
    const table7 = table_deps.table7;
    const gov_info = info_deps.table7_gov_info;
    const t4_info = info_deps.table4_dept_info;
    const q = table7.q(subject);

    const cols =  _.map(std_years, year => year+"exp");

    var all_years = q.get_cols(["tp"].concat(cols),{zip:true});
    STATS.year_over_year_multi_stats(add, "tp_exp",all_years);

    var all_years_type = _.chain(q.types()) 
      .map(function(type){
        return _.chain(std_years)
          .map( function(year,i){
            var val = table7.payment_types(year+"exp",subject,true)[type];
            if (i === 0){
              return [type, val];
            } else {
              return val;
            }
          })
          .flatten()
          .value();
      })
      .value();

    STATS.year_over_year_multi_stats(add, "tp_type_exp",all_years_type);

    STATS.add_all_years(
      add,
      "tp_exp",
      std_years,
      year => q.sum(year+"exp")
    );

    const value = c.dept_tp_exp_pa_last_year/ gov_info.gov_tp_exp_pa_last_year;
    const type = value < 0.01 ? "percentage2" : "percentage1";
    add({
      "value" : value, 
      "key":  "tp_exp_ratio_gov_pa_last_year",
      "type": type,
    });


    //add({
    //  "wait_for": {
    //    "key" :  "gov_tp_exp_last_year",
    //    "ready":function(){
    //      var value = c.dept_tp_exp_last_year/ c.gov_tp_exp_last_year;
    //      var type = value < 0.01 ? "percentage2" : "percentage1";
    //      add({
    //        "value" : value, 
    //        "key":  "tp_exp_ratio_gov_last_year",
    //        "type": type
    //      });
    //    }
    //  }
    //});

    add({
      "value" :  c.dept_tp_exp_pa_last_year/ t4_info.dept_exp_pa_last_year,
      "key":  "tp_exp_ratio_pa_last_year",
      "type": "percentage1",
    });

    //add({
    //  "wait_for": {
    //    "key" :  "dept_exp_last_year",
    //    "ready":function(){
    //      add({
    //        "value" :  c.dept_tp_exp_last_year/ c.dept_exp_last_year,
    //        "key":  "tp_exp_ratio_last_year",
    //        "type": "percentage1",
    //      });
    //    }
    //  }
    //});
  },
})











