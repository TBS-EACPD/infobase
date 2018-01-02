"use strict";
exports = module.exports;


require("./table104.ib.yaml");
// see [here](../table_definition.html) for description
// of the table spec
const {text_maker} = require("../../models/text");
var FORMAT = require('../../core/format');

var fYearMap = {
  2011: "2011-2012",
  2012: "2012-2013",
  2013: "2013-2014",
  2014: "2014-2015",
  2015: "2015-2016",
};

module.exports = {
  "id": 'table104',
  "classification" : "dnd",
  "tags" : [
    "LAPSE",
    "AUTH",
    "EXP",
    "VOTED",
  ],
  "name": { "en":  "Lapses by Vote (Gross and Net)",      
    "fr":  "Fonds inutilisés bruts et nets par crédit",
  },
  "title": { "en":  "Lapses by Vote (Gross and Net) ({{pa_last_year_5}} to {{pa_last_year}} $000)",
    "fr":  "Fonds inutilisés bruts et nets par crédit ({{pa_last_year_5}} to {{pa_last_year}}, $000)",
  },
  "add_cols": function(){
    _.map([
      { "nick" : "dept",
        "type":"int",
        "key" : true,
        "hidden" : true,
        "header":'',
      },
      { "nick" : "votenum",
        "type":"str",
        "key" : true,
        "pivot" : {
          "gov" : function(rows){
          // at the government level, remove the vote numbers
          // so the vote types can collapse together
            return _.uniqBy(_.map(rows, function(row){
            // split the string and return only second part
              return row.votenum.split(" - ")[1];
            }));
          },
          "dept" : true,
        },
        "header":{
          "en":"Vote",
          "fr":"Crédit",
        },
      },
      { "nick" : "votestattype",
        "type":"int",
        "key" : true,
        "hidden" : true,
        "header":'',
      },
      { "nick" : "fyear",
        "type":"str",
        "key" : true,
        "pivot" : true,
        "header":{
          "en":"Fiscal Year",
          "fr":"Exercice",
        },
      },
      { "nick": "authorities",
        "type": "big_int",
        "header": {
          "en": "Authority",
          "fr": "Autorités",
        },
        "description": {
          "en": "Year-end Authorities (net of revenues and receipts available for spending)",
          "fr": "Autorisations en fin d’exercice(après déduction des recettes et rentrées disponibles pour dépenses).",
        },
      },
      { "nick": "expenditures",
        "type": "big_int",
        "header": {
          "en": "Expenditure",
          "fr": "Dépenses",
        },
        "description": {
          "en": "Year-end expenditures (net of revenues and receipts available for spending)",
          "fr": "Dépenses en fin d’exercice(après déduction des recettes et rentrées disponibles pour dépenses).",
        },
      },
      { "nick": "lapse_gross",
        "type": "big_int",
        "formula" : function(table,row){
          if (_.isArray(row)){
            return d4.sum(_.map(row,"authorities")) -  d4.sum(_.map(row,"expenditures"));
          }
          return  row.authorities - row.expenditures;
        },
        "header": {
          "en": "Gross Lapse",
          "fr": "Fonds inutilisés bruts",
        },
        "description": {
          "en": "Year-end authorities minus expenditures",
          "fr": "Autorisations en fin d’exercice, moins les dépenses",
        },
      },
      { "nick": "lapse_pct",
        "type": "percentage",
        "formula" : function(table,row){
          if (_.isArray(row)){
            return 1 - d4.sum(_.map(row,"expenditures")) /  d4.sum(_.map(row,"authorities"));
          }
          return 1 - row.expenditures/row.authorities;
        },
        "header": {
          "en": "Gross Lapse Pct.",
          "fr": "Fonds inutilisés bruts en pourcentage ",
        },
        "description": {
          "en": "Year-end gross lapse divided by year-end authorities",
          "fr": "Fonds inutilisés bruts en fin d’exercice, divisée par les autorisations en fin d’exercice",
        },
      },
      {
        "type": "big_int",
        "nick": "multis",
        "header": {
          "en": "Multi-year Appropriations",
          "fr": "Crédits pluriannuels",
        },
        "description": {
          "en": "Appropriation with a specific purpose and monetary limit granted by Parliament that can be utilized over more than one fiscal year",
          "fr": "Affectation à but précis et limite monétaire, fixée par le Parlement, qui peut être utilisée plus d’une fois au cours d’un exercice financier",
        },
      },
      //removed because it was pointed out this is nearly always zero
      //{
      // "type": "big-int",
      // "nick": "expenditures_over",
      // "header": {
      //     "en": "Over Expenditure",
      //     "fr": "Dépassement"
      // },
      // "description": {
      //    "en": "Excess of spending over authorities granted",
      //    "fr": "Excédent des dépenses sur les autorisations accordées"
      // }
      //},
      {
        "type": "big_int",
        "nick": "lapse_PA",
        "header": {
          "en": "Public Accounts Lapse",
          "fr": "Fonds inutilisés des comptes publics",
        },
        "description": {
          "en": "The lapse as per Public Accounts is obtained by removing the multi-year appropriation from the gross lapse (Expenditures minus Authorities)",
          "fr": "Les fonds inutilisés selon les comptes publics est établie en soustrayant les crédits pluriannuels de la péremption brute (dépenses moins les autorisation) ",
        },
      },
      {
        "type": "percentage",
        "nick": "lapse_PA_pct",
        "formula" : function(table,row){
          if (_.isArray(row)){
            return d4.sum(_.map(row,"lapse_PA")) /  d4.sum(_.map(row,"authorities"));
          }
          return row.lapse_PA/row.authorities;
        },                      
        "header": {
          "en": "Public Accounts Lapse Pct.",
          "fr": "Fonds inutilisés des comptes publics en pourcentage.",
        },
        "description": {
          "en": "Public Accounts lapse divided by Public Accounts authorities",
          "fr": "Fonds inutilisés des comptes publics divisées par les autorisations des comptes publics",
        },
      },
      {
        "type": "big_int",
        "nick": "allot_frozen",
        "header": {
          "en": "Frozen Allotments",
          "fr": "Fonds bloqués",
        },
        "description": {
          "en": "Items or amounts that departments or agencies have been directed to lapse or to which they will not have access until a specified condition is completed",
          "fr": "Postes ou montants que les ministères et organismes ont pour consigne de reporter ou de ne pas dépenser avant d’avoir satisfait à une condition particulière",
        },
      },
      {
        "type": "big_int",
        "nick": "SPA_unspent",
        "header": {
          "en": "SPA Unspent",
          "fr": "Affectation à but spécial inutilisés",
        },
        "description": {
          "en": "A special purpose allotment is used to set apart a portion of an organization's voted appropriation for a specific initiative or item",
          "fr": "Une affectation à but spécial (ABS) sert à réserver une partie des crédits approuvés d’une organisation aux fins d’une initiative ou d’un poste en particulier",
        },
      },
      {
        "type": "big_int",
        "nick": "lapse_net",
        "simple_default": true,
        "header": {
          "en": "Net Lapse",
          "fr": "Fonds inutilisés nettes",
        },
        "description": {
          "en": "Public Accounts lapses minus SPA, Frozen Allotments and Budget Carry Forwards",
          "fr": "Fonds inutilisés des comptes publics, moins les ABS et les reports budgétaires",
        },
      },
      {
        "type": "percentage",
        "nick": "lapse_net_pct",
        "formula" : function(table,row){
          if (_.isArray(row)){
            return d4.sum(_.map(row,"lapse_net")) /  d4.sum(_.map(row,"authorities"));
          }
          return row.lapse_net/row.authorities;
        },           
        "header": {
          "en": "Net Lapse Pct.",
          "fr": "Fonds inutilisés nets pourcentage",
        },
        "description": {
          "en": "Net lapses divided by year-end authorities (net of revenues and receipts available for spending)",
          "fr": "Fonds non utilisés nets divisés par les autorisations en fin d’exercice (après déduction des recettes et rentrées disponibles pour dépenses)",
        },
      },
      {
        "type": "big_int",
        "nick": "carry_forward",
        "header": {
          "en": "Carry Forward",
          "fr": "Report",
        },
        "description": {
          "en": "Lapsed authorities amounts that departments are allowed to carry forward from one fiscal year to the following fiscal year. Applies to operating vote and capital votes authorities only.",
          "fr": "Montants des autorisations non utilisées que les ministères peuvent reporter au prochain exercice. Cela s’applique seulement aux autorisations de crédits de fonctionnement et de crédits en capital",
        },
      },
    ],_.bind(this.add_col,this));
  },
  "queries" : {

    "lapse_by_vote_fyear" : function() {
      var vote_type = _.chain(this.data)
        .map("votestattype")
        .sort()
        .head();
      return _.filter(this.data, function(item) { return item.votestattype === vote_type; });
    },

    "auth_change" : function(format) {
      // returns last year, this year, and change
      var this_year = "thisyearauthorities",
        last_year = "lastyearauthorities",
        total = this.sum([this_year, last_year]),
        change =  total[this_year] / (total[last_year])-1,
        data =  [total[this_year],total[last_year],change];
      if (!format){
        return data;
      }
      return FORMAT.list_formater(['big_int','big_int',"percentage"], data);
    },
    "exp_change" : function(format) {
      // returns last year, this year, and change
      var this_year = "thisyearexpenditures",
        last_year = "lastyearexpenditures",
        total = this.sum([this_year, last_year]),
        change =  total[this_year] / (total[last_year]) - 1,
        data =  [total[this_year],total[last_year],change];
      if (!format){
        return data;
      }
      return FORMAT.list_formater(['big_int','big_int',"percentage"], data);
    },
    "lapse_change" : function(format) {
      // returns last year, this year, and change
      var this_year = "thisyearlapse",
        last_year = "lastyearlapse",
        total = this.sum([this_year, last_year]),
        change =  total[this_year] / (total[last_year]) - 1,
        data =  [total[this_year],total[last_year],change];
      if (!format){
        return data;
      }
      return FORMAT.list_formater(['big_int','big_int',"percentage"], data);
    },
  },
  "dimensions" : [
    {
      title_key : "by_fyear_vote",
      include_in_report_builder : true,

      filter_func : function(options){
        return function(d){
          return text_maker("vstype"+d.votestattype )+ " - " +d.fyear;
        }
      },
    },
  ],
  //"sort": _.Identity;,
  "mapper": function (row) {
    if (row[0]!=='ZGOC'){
      row[1] += " - "  +  text_maker("vstype"+row[2]);
    }
	

    row[3] = fYearMap[row[3]];
    
    return row;
  },
  "details" : {
    // this will be called as the tabled is being created
    // and we're going to use this as an opportunity to colour
    // the average rows 
    "rowseach" : function(_this,d,i){
      if (d[1].val === text_maker("sub_avg")){
        d4.select(_this).attr("class","success");
      }
    },
    "modify_for_presentation" : function(col_objs,rows){
      col_objs = _.filter(col_objs, function(col_obj){ return col_obj.key !== true;});
      rows = _.chain(rows)
        // separate the rows by vote/stat
        .groupBy(function(row){
          return row.votenum;
        })
        // for each group of rows, calculate a new average row
        .map(function(row_group){
          // add in an average row, start by cloning the first
          // row in the group
          var new_row  = _.clone(row_group[0]);
          // change the fiscal year to "average"
          new_row.fyear = text_maker("sub_avg");
          // for each requested column calculate the average
          // for percentage columns, denominator is defaulted to 1 to have no effect
          _.each(col_objs, function(col_obj){
            var denominator = row_group.length;
            if (col_obj.type === "percentage") { denominator = 1; }

            new_row[col_obj.nick || col_obj.wcag] = col_obj.formula(_.filter(row_group,function(row_group_member) { return row_group_member.fyear !== ("Average" || "Moyenne"); }))/denominator;
          });
          //append as the last row of the group
          row_group.push(new_row);

          return row_group;
        })
        // groupBy produces an Object, so we lose our ordering,
        // need to re-sort the groups
        .sortBy(function(row){
          var vote_num = row[0].votenum;
          if (!_.isNumber(vote_num)){
            vote_num = Infinity;
          }
          return [vote_num, row[1].fyear];
        })
        // merge the groups back together
        .flatten(true)
        .value();
      return rows;
    },
    "prepare_total" : function(col_objs,raw_data){
      return _.chain(raw_data)
      // remove the average rows
        .filter(function(row){
          return row.fyear !== text_maker("sub_avg");
        })
      // group the rows by fiscal year to produce a sum
      // by fiscal year
        .groupBy(function(row){
          return row.fyear;
        })
      // for each group calculate a total row
        .map(function(rows){
          var val;
          return _.map(col_objs, function(col_obj,i){
            if (i === 0){
              val = text_maker("total");
            } else if (i === 1){
              val = rows[0].fyear;
            }else if (_.isFunction(col_obj.formula)){
              val = col_obj.formula(rows );
            }
            return { val : val };
          });
        })
      // sort the rows by fiscal year
        .sortBy(function(row){
          return row[1].val;
        })
        .value();
    },
  

  },
};
