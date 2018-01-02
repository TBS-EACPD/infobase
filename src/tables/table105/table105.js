"use strict";
exports = module.exports;


require("./table105.ib.yaml");

// see [here](../table_definition.html) for description
// of the table spec
const {  major_vote_stat } = require('../table_common.js');
const {text_maker} = require("../../models/text");
const years = ["{{pa_last_year_2}}", "{{pa_last_year}}"]

module.exports = {
  "id": 'table105',
  "classification" : "not_public",
  "tags" : [
    "ALLOT",
    "AUTH",
    "EXP",
    "VOTED",
  ],
  "name": { 
    "en":  "Voted Authorities & Expenditures by Allotments",
    "fr":  "Données par votes et par affectation",
  },
  "title": { 
    "en": "Voted Authorities & Expenditures by Allotments " + years[0] + " to " + years[1] + " ($000)",
    "fr": "Autorisations votées et dépenses, par affectation de " + years[0] + " à " + years[1] + " (000 $)",
  },
  "add_cols": function(){
      
    this.add_col("")
      .add_child([
        { "nick":"dept",
          "type":"int",
          "key":true,
          "hidden":true,
          "header":'',
        },
        { "nick" : "votenum",
          "type":"int",
          "key" : true,
          "header":{
            "en":"Vote / Statutory",
            "fr":"Crédit / Légis",
          },
        },
        { "nick" : "votestattype",
          "type":"int",
          "key" : true,
          "hidden" : true,
          "header":'',
        },
        { "nick" : "vote_desc",
          "type":"str",
          "key" : true,
          "header":{
            "en":"Vote Description",
            "fr":"Description du crédit",
          },
        },
        { "nick" : "alot_description",
          "type":"str",
          "key" : true,
          "header":{
            "en" : "Allotment Description",
            "fr" : "Description de l'affectation",
          },
        },
        { "nick" : "sub_alot",
          "type":"str",
          "key" : true,
          "header":{
            "en" : "Sub-Allotment",
            "fr" : "Sous-affectation",
          },
        },
      ]);
    
    _.each(years, (year, i)=>{
      this.add_col(year)
        .add_child([
          { "nick" : year+"auth",
            "type":"big_int_real",
            "header":{
              "en" : "Authority",
              "fr" : "Autorités",
            },
            "description" : {
              "en" : "Year-end authorities available for spending during "+year,
              'fr' : "Autorisations en fin d’exercice disponibles pour dépenses en " + year,
            },
          }, 
          { "nick" : year+"froz",
            "type":"big_int_real",
            "header":{
              "en" : "Frozen",
              "fr" : "Fonds bloqués",
            },
            "description" : {
              "en" : "Authorities in frozen allotments in "+year,
              'fr' : "Autorisations dans les affectations bloquées de "+ year,
            },
          }, 
          { "nick" : year+"exp",
            "simple_default": i===1,
            "type":"big_int_real",
            "header":{
              "en" : "Expenditures",
              "fr" : "Dépenses",
            },
            "description" : {
              "en" : "Year-end expenditures in "+year,
              'fr' : "Dépenses de fin d’exercice en "+year,
            },
          }, 
        ]);
    });
              
  },
  "queries" : {  },
  "dimensions" : [
    {
      title_key :"item",
      include_in_report_builder : true,

      filter_func :  function(options) {
        return function(row){
          return row.sub_alot;
        };
      },
    },
    {
      title_key :"spa",
      include_in_report_builder : true,

      filter_func :  function(options) {
        return function(row){
          return row.alot_description;
        };
      },
    },
    {
      title_key : "major_voted_stat",
      include_in_report_builder : true,
      filter_func :  major_vote_stat,
    },
  ],
  "sort": function(mapped_rows){
    return _.chain(mapped_rows) 
      .sortBy(function(row){  
        return row.sub_alot;
      })
      .sortBy(function(row){  
        return row.votenum;
      })
      .value();
  },
  "mapper": function (row) {
              
    row.splice(3,0,text_maker("vstype"+row[2]));
        
    if (this.lang === "en") { 
      row.splice(5,1); row.splice(6,1)
    } else {
      row.splice(4,1); row.splice(5,1);  
    }	  
    return row;
  },
};
