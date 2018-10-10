
function compute_counts_from_set({results, indicators}){
  const drr16_indicators = _.filter(indicators, { doc: 'drr16'}),
    drr16_indicators_past_success = _.filter(drr16_indicators, {status_key: 'past_success'}).length,
    drr16_indicators_past_failure = _.filter(drr16_indicators, {status_key: 'past_failure'}).length,
    drr16_indicators_past_not_appl = _.filter(drr16_indicators, {status_key: 'past_not_appl'}).length,
    drr16_indicators_past_not_avail = _.filter(drr16_indicators, {status_key: 'past_not_avail'}).length,

    drr16_indicators_future_success = _.filter(drr16_indicators, {status_key: 'future_success'}).length,
    drr16_indicators_future_failure = _.filter(drr16_indicators, {status_key: 'future_failure'}).length,
    drr16_indicators_future_not_avail = _.filter(drr16_indicators, {status_key: 'future_not_avail'}).length,
    drr16_indicators_future_not_appl = _.filter(drr16_indicators, {status_key: 'future_not_appl'}).length,

    drr16_past_total = drr16_indicators_past_not_avail + drr16_indicators_past_not_appl + drr16_indicators_past_success + drr16_indicators_past_failure,
    drr16_future_total = drr16_indicators_future_not_avail + drr16_indicators_future_not_appl + drr16_indicators_future_success + drr16_indicators_future_failure,

    drr16_total = drr16_future_total + drr16_past_total;

  return {
    dp18_results: _.filter(results, { doc: 'dp18' }).length,
    dp18_indicators: _.filter(indicators, { doc: 'dp18' }).length,
    drr16_results: _.filter(results, { doc: 'drr16' }).length,

    drr16_indicators_future_success,
    drr16_indicators_future_failure,
    drr16_indicators_future_not_appl,
    drr16_indicators_future_not_avail,

    drr16_indicators_past_success,
    drr16_indicators_past_failure,
    drr16_indicators_past_not_appl,
    drr16_indicators_past_not_avail,

    drr16_past_total,
    drr16_future_total,
    drr16_total,
  };
}

// Used by copy_static_asset, node only supports commonjs syntax
module.exports = { compute_counts_from_set }