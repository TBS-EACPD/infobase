exports = module.exports;

require("./cr_spending.ib.yaml");


// see [here](../table_definition.html) for description
// of the table spec
//const {spending_areas} = require('../../models/goco.js');

const {
  Subject : {CRSO},
  years : { planning_years},
} = require("../table_common");

  
module.exports = {
  "id": "cr_spending",
  subject_type: "cr",
  source: [ "PA" , "DP", "DRR" ],
  "tags" : [
    "PLANNED_EXP",
    "CR",
  ],


  "name": { 
    "en": "Spending by Core Responsibility",
    "fr": "Dépenses par responsabilité essentielle",
  },

  "title": { 
    "en": "Planned Spending by Core Responsibility from {{planning_year_1}} to {{planning_year_3}} ($000)",
    "fr": "Dépenses prévues par responsabilité essentielle de {{planning_year_1}} à {{planning_year_3}} (en milliers de dollars)",
  },


  "add_cols" : function(){
    this.add_col({nick : "preamble","header": ""})
      .add_child([
        {
          "type":"int",
          "key" : true,
          "hidden" : true,
          "nick" : "dept",
          "header":'',
        },{
          "key" : true,
          "hidden" : true,
          "type":"str",
          'nick' : 'cr_id',
          "header": "",
        },
        {
          "key" : true,
          "type":"wide-str",
          'nick' : 'cr_name',
          "header":{
            "en":"Core Responsibility",
            "fr":"Responabilité essentielle",
          },
        },
      ]);
    _.each(planning_years, (header, ix) =>{
      this.add_col(header)
        .add_child([
          {
            "type":"big_int",
            "nick":header,
            "header":{
              "en": "Planned Spending",
              "fr": "Dépenses prévues",
            },
            simple_default: ix === 0,
            "description": {
              "en": `Corresponds to total planned spending for the fiscal year ${header}, including additional funds approved by Treasury Board.`,
              "fr": `Correspondent au total des dépenses prévues pour l'exercice ${header}, y compris les fonds approuvés par le Conseil du Trésor.`,
            },
          },
        ]);
    });

  },

  mapper: function (row) {
    const cr = CRSO.lookup(row[1]);
    row.splice(2,0,cr.name);
    return row;
  },

  process_mapped_row: function(mapped_row){
    const cr_obj = CRSO.lookup(mapped_row.cr_id);
    this.crs.set(cr_obj, [mapped_row]); //assumption: only one row per program... This is not consistent with e.g. table305. 
  },
  dimensions: [],
};







