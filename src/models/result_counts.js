
function compute_counts_from_set({results,indicators}){
  const drr16_indicators = _.filter(indicators, { doc: 'drr16'}),
    drr16_indicators_past_success =  _.filter(drr16_indicators, {status_key: 'past_success'}).length,
    drr16_indicators_past_failure = _.filter(drr16_indicators, {status_key: 'past_failure'}).length,
    drr16_indicators_past_not_appl = _.filter(drr16_indicators, {status_key: 'past_not_appl'}).length,
    drr16_indicators_past_not_avail = _.filter(drr16_indicators, {status_key: 'past_not_avail'}).length,

    drr16_indicators_future_success = _.filter(drr16_indicators, {status_key: 'future_success'}).length,
    drr16_indicators_future_failure = _.filter(drr16_indicators, {status_key: 'future_failure'}).length,
    drr16_indicators_future_not_avail = _.filter(drr16_indicators, {status_key: 'future_not_avail'}).length,
    drr16_indicators_future_not_appl = _.filter(drr16_indicators, {status_key: 'future_not_appl'}).length,

    drr16_indicators_other_success = _.filter(drr16_indicators, {status_key: 'other_success'}).length,
    drr16_indicators_other_failure = _.filter(drr16_indicators, {status_key: 'other_failure'}).length,
    drr16_indicators_other_not_avail = _.filter(drr16_indicators, {status_key: 'other_not_avail'}).length,
    drr16_indicators_other_not_appl = _.filter(drr16_indicators, {status_key: 'other_not_appl'}).length,


    drr16_past_total = drr16_indicators_past_not_avail +  drr16_indicators_past_not_appl + drr16_indicators_past_success + drr16_indicators_past_failure,
    drr16_future_total = drr16_indicators_future_not_avail + drr16_indicators_future_not_appl + drr16_indicators_future_success + drr16_indicators_future_failure,
    drr16_other_total = drr16_indicators_other_success + drr16_indicators_other_failure + drr16_indicators_other_not_appl + drr16_indicators_other_not_avail,

    drr16_total = drr16_future_total + drr16_past_total + drr16_other_total;


  return { 
    dp17_results: _.filter(results, { doc: 'dp17' }).length,
    dp17_indicators:  _.filter(indicators, { doc: 'dp17' }).length,
    drr16_results: _.filter(results, { doc: 'drr16' }).length,

    drr16_indicators_future_success,
    drr16_indicators_future_failure,
    drr16_indicators_future_not_appl,
    drr16_indicators_future_not_avail,

    drr16_indicators_past_success,
    drr16_indicators_past_failure,
    drr16_indicators_past_not_appl,
    drr16_indicators_past_not_avail,

    drr16_indicators_other_success,
    drr16_indicators_other_failure,
    drr16_indicators_other_not_avail,
    drr16_indicators_other_not_appl,

    drr16_past_total,
    drr16_future_total,
    drr16_other_total,
    drr16_total,
  };
}

module.exports = exports = {
  compute_counts_from_set,
};
