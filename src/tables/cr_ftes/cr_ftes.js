exports = module.exports;
require("./cr_ftes.ib.yaml");
// see [here](../table_definition.html) for description
// of the table spec
//


const {
  Subject : { CRSO },
  m, 
  years : { planning_years },
} = require("../table_common");

module.exports = {
  "id": "cr_ftes",
  source: [ "DP", "DRR" ],
  //"tags" : ["results", "expenditures", "FTE", "planning","report","RPP"],
  "tags" : [
    "FTE",
    "CR",
  ],

  "name": { 
    "en":  "Full-Time Equivalents (FTEs) by Core Responsibility",
    "fr":  "Équivalents temps plein (ETP) par responsabilité essentielle",
  },

  "title": { 
    "en": "Planned Full-Time Equivalents (FTEs) by Core Responsibility from {{planning_year_1}} to {{planning_year_3}}",
    "fr": "Équivalents temps plein (ETP) actuels et prévus par responsabilité essentielle de {{planning_year_1}} à {{planning_year_3}}",
  },

  "footnote-topics" : {
    "group" :["planned_spending"],
    "table" :["~planned_spending","planned_spending_gov"],
  },

  "add_cols": function(){
    this.add_col({
      "type":"int",
      "key" : true,
      "hidden" : true,
      "nick" : "dept",
      "header":'',
    })
    this.add_col({
      "key" : true,
      "hidden" : true,
      "type":"str",
      'nick' : 'cr_id',
      "header": "",
    });
    this.add_col({
      "key" : true,
      "type":"wide-str",
      'nick' : 'cr_name',
      "header":{
        "en":"Core Responsibility",
        "fr":"Responsabilité essentielle",
      },
    })
   
    _.each(planning_years, (header, ix)=>{
      this.add_col({ 
        "type":"big_int_real",
        "nick":header,
        "header":{
          "en": header + "  " + m("Planned FTEs"),
          "fr": header + "  " + m("ETP prévus"),
        },
        simple_default: ix === 0,
        "description": {
          "en": `Corresponds to the total number of planned FTEs for the fiscal year ${header}`,
          "fr": `Correspond au nombre total d'équivalents temps plein (ETP) prévus pour l'exercice ${header}`,
        },
      });
    });

  },


  "mapper": function (row) {
    const cr = CRSO.lookup(row[1]);
    row.splice(2,0,cr.name);
    return row;
  },

  process_mapped_row(mapped_row){
    const cr_obj = CRSO.lookup(mapped_row.cr_id);
    this.crs.set(cr_obj, [mapped_row]); //assumption: only one row per program... This is not consistent with e.g. table305. 
  },

  dimensions: [],

}

