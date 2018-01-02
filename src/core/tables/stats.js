const { run_template } = require('../../models/text.js');


// module for calculating basic stats and injecting the values
// into the provided context object
module.exports = exports = {

  
  add_all_years(add,context_prefix, years, amounts){
    let total = 0;
    let prefix = context_prefix === '' ? "" : context_prefix + '_';
    _.each(years, (year,i)=>{
      var amount;
      if (_.isFunction(amounts)){
        amount =  amounts(year,i);
        add(prefix+year, amount);
      }else {
        amount =  amounts[i];
        add(prefix+year, amount);
      }
      total += amount;
    });
    add(context_prefix + "_total",total);
    add( context_prefix + "_average", total/years.length);
  },
  
  year_over_year_single_stats(add,context_prefix,years,amounts ){
    // * `context` is an object which will have the calculated values added
    // * `context_prefix` is a string which will be used to created the keys
    //    in `context`
    // * `years` is an array of years
    // * `amounts` is an array of numbers (not percentage figures) indexed to the 
    //   years array
    var total = 0;
    var max = -Infinity;
    var min = Infinity;
    var max_year;
    var min_year;
    var average;
    var variance;
    var std_dev;
    var co_var;
    // find the min and max amouts and the years in which they occurred
    _.each(amounts, function(amount,index){
      total += amount;
      if (amount > max) {
        max = amount;
        max_year = years[index];
      } 
      if ( amount < min){
        min = amount;
        min_year = years[index];
      }
    });
    // divide the total by the number of years active
    average = total/years.length;
    variance =  _.reduce(amounts, function(x,y){
      return x + Math.pow(y-average,2);
    },0)/years.length;
    std_dev = Math.sqrt(variance);
    co_var = std_dev / average;
    add(context_prefix+"_average",  average);
    // calculate the variance
    // calculate the standard devitation
    add({
      key :  context_prefix+"_high_var",
      value :  co_var > 0.05,
      type : "boolean",
    });
    // assign the calculated values to the context object
    // using the provided context_prefix
    add(context_prefix+"_max", max);
    add(context_prefix+"_max_year", max_year);
    add(context_prefix+"_min", min) ;
    add(context_prefix+"_min_year", min_year);
    //TODO maybe add change between the two most recent years
  },
  
  year_over_year_multi_stats(add, context_prefix,amounts ){
    // * `context` is an object which will have the calculated values added
    // * `context_prefix` is a string which will be used to created the keys
    //    in `context`
    // * `amounts` in the following format:
    //   ``` amounts = [
    //        ["label", year1, year2, year3]
    //        ["label", year1, year2, year3]
    //        ["label", year1, year2, year3]
    //        ["label", year1, year2, year3]
    //   ]``` 

    var labels = _.map(amounts,0);
    var totals = _.map(amounts, function(row){
      return d4.sum(_.tail(row));
    });
    var averages = _.map(totals, function(d){
      return d/_.tail(amounts[0]).length;
    });
    var max = d4.max(totals);
    var max_index = _.indexOf(totals,max);
    var max_row = amounts[max_index];
    var max_label = labels[max_index];
    var max_avg = averages[max_index];
    var max_co_var =  Math.sqrt(_.reduce(_.tail(max_row), function(x,y){
      return x + Math.pow(y-max_avg,2);
    },0)/_.tail(amounts[0]).length)/max_avg;

    add(context_prefix +"_top",max_label);
    add(context_prefix +"_top_amnt",max);
    add(context_prefix +"_top_avg",max_avg);
    add(context_prefix +"_top_avg_percent",max/d4.sum(totals));
    add({
      key :  context_prefix+"_top_high_var",
      value :  max_co_var > 0.05,
      type : "boolean",
    });
  
    if (amounts.length > 1) {
      var min = d4.min(totals);
      var min_index = _.indexOf(totals,min);
      var min_row = amounts[min_index];
      var min_label = labels[min_index];
      var min_avg = averages[min_index];
      add(context_prefix +"_bottom",min_label);
      add(context_prefix +"_bottom_amnt",min);
      add(context_prefix +"_bottom_avg",min_avg);
      add(context_prefix +"_bottom_avg_percent",min/d4.sum(totals));
      
      var min_co_var =  Math.sqrt(_.reduce(_.tail(min_row), function(x,y){
        return x + Math.pow(y-min_avg,2);
      },0)/_.tail(amounts[0]).length)/min_avg;
      add({
        key :  context_prefix+"_bottom_high_var",
        value :  min_co_var > 0.05,
        type : "boolean",
      });
    }
  },

  year_over_year_multi_stats_active_years(add, context_prefix, amounts,  act_years, years){
    // * `context` is an object which will have the calculated values added
    // * `context_prefix` is a string which will be used to created the keys
    //    in `context`
    // * `amounts` in the following format:
    //   ``` amounts = [
    //        ["label", year1, year2, year3]
    //        ["label", year1, year2, year3]
    //        ["label", year1, year2, year3]
    //        ["label", year1, year2, year3]
    //   ]``` 
    var active_years;
	
    if(act_years) {
      active_years = act_years;
    } else { 
      var amounts_temp = amounts;
      amounts_temp = _.map(amounts_temp, amounts_temp =>  _.tail(amounts_temp) );
      amounts_temp = _.zip.apply(_,amounts_temp); 
      amounts_temp = _.map(amounts_temp, amounts_temp => d4.sum(amounts_temp) );
      //The following determines the first and last "active year" for a given department, 
      //assumes no middle stoppage
      var m = run_template;
      var first_active_year_index = _.findIndex( amounts_temp, amounts_temp => amounts_temp !== 0 );
      var last_active_year_index = _.findLastIndex(amounts_temp, amounts_temp =>  amounts_temp !== 0 );
      if (first_active_year_index > 0){
        add(context_prefix +"_first_active_year",m(years[first_active_year_index]));
      } else {
        add(context_prefix +"_first_active_year",m(years[0]));
      }
      if (last_active_year_index > 0){
        add(context_prefix +"_last_active_year",m(years[last_active_year_index]));
      } else {
        add(context_prefix +"_last_active_year",m(years[4])); 
      }
      add(context_prefix +"_number_active_years",last_active_year_index - first_active_year_index + 1);
      amounts_temp = _.countBy(amounts_temp,function(amounts_temp){return amounts_temp === 0 ? 'inactive': 'active';});
      active_years = amounts_temp.active;
    }
	
    var labels = _.map(amounts,0);
    var totals = _.map(amounts, function(row){
      return d4.sum(_.tail(row));
    });
    var averages = _.map(totals, function(d){
      return d/active_years;
    });
    var max = d4.max(totals);
    var max_index = _.indexOf(totals,max);
    var max_row = amounts[max_index];
    var max_label = labels[max_index];
    var max_avg = averages[max_index];
    var max_co_var =  Math.sqrt(_.reduce(_.tail(max_row), function(x,y){
      return x + Math.pow(y-max_avg,2);
    },0)/_.tail(amounts[0]).length)/max_avg;
  
    add(context_prefix +"_top",max_label);
    add(context_prefix +"_top_amnt",max);
    add(context_prefix +"_top_avg",max_avg);
    add(context_prefix +"_top_avg_percent",max/d4.sum(totals));
    add({
      key :  context_prefix+"_top_high_var",
      value :  max_co_var > 0.05,
      type : "boolean",
    });
  
    if (amounts.length > 1) {
      var min = d4.min(totals);
      var min_index = _.indexOf(totals,min);
      var min_row = amounts[min_index];
      var min_label = labels[min_index];
      var min_avg = averages[min_index];
      add(context_prefix +"_bottom",min_label);
      add(context_prefix +"_bottom_amnt",min);
      add(context_prefix +"_bottom_avg",min_avg);
      add(context_prefix +"_bottom_avg_percent",min/d4.sum(totals));

      var min_co_var =  Math.sqrt(_.reduce(_.tail(min_row), function(x,y){
        return x + Math.pow(y-min_avg,2);
      },0)/_.tail(amounts[0]).length)/min_avg;
    
      add({
        key :  context_prefix+"_bottom_high_var",
        value :  min_co_var > 0.05,
        type : "boolean",
      });
    }
  },
      
  one_year_top3(add,context_prefix,amounts ){
    // * `context` is an object which will have the calculated values added
    // * `context_prefix` is a string which will be used to created the keys
    //    in `context`
    // * `amounts` is a **sorted** array of [labels ,numbers] (not percentage figures)
    var counter = 0;
    if (amounts.length >0){
      add(context_prefix+"_top1",amounts[0][0]);
      add(context_prefix+"_top1_amnt",amounts[0][1]);
      counter+=1;
    }
    if (amounts.length >1){
      add(context_prefix+"_top2",amounts[1][0]);
      add(context_prefix+"_top2_amnt",amounts[1][1]);
      counter+=1;
    }
    if (amounts.length >3){
      add(context_prefix+"_top3",amounts[2][0]);
      add(context_prefix+"_top3_amnt",amounts[2][1]);
      counter+=1;
    }
    add(context_prefix+"_top_num",  counter);
  },
  
  one_year_top2_bottom1(add,context_prefix,amounts ){
    // * `context` is an object which will have the calculated values added
    // * `context_prefix` is a string which will be used to created the keys
    //    in `context`
    // * `amounts` is a **sorted** array of numbers (not percentage figures)
    if (amounts.length >2){
      add(context_prefix+"_top1", amounts[0][0]);
      add(context_prefix+"_top2", amounts[1][0]);
      add(context_prefix+"_bottom1", _.last(amounts)[0]);
      add(context_prefix+"_top1_amnt", amounts[0][1]);
      add(context_prefix+"_top2_amnt", amounts[1][1]);
      add(context_prefix+"_bottom1_amnt", _.last(amounts)[1]);
    }
  },
};
