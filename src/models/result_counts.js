
function compute_counts_from_set({results, indicators}){
  const drr17_indicators = _.filter(indicators, { doc: 'drr17'}),
    drr17_indicators_past_met = _.filter(drr17_indicators, {status_key: 'past_met'}).length,
    drr17_indicators_past_not_met = _.filter(drr17_indicators, {status_key: 'past_not_met'}).length,
    drr17_indicators_past_not_reported = _.filter(drr17_indicators, {status_key: 'past_not_reported'}).length,

    drr17_indicators_future_to_be_achieved = _.filter(drr17_indicators, {status_key: 'future_to_be_achieved'}).length,

    drr17_past_total = drr17_indicators_past_not_reported + drr17_indicators_past_met + drr17_indicators_past_not_met,
    drr17_future_total = drr17_indicators_future_to_be_achieved,

    drr17_total = drr17_future_total + drr17_past_total;

  return {
    dp18_results: _.filter(results, { doc: 'dp18' }).length,
    dp18_indicators: _.filter(indicators, { doc: 'dp18' }).length,
    drr17_results: _.filter(results, { doc: 'drr17' }).length,

    drr17_indicators_past_met,
    drr17_indicators_past_not_met,
    drr17_indicators_past_not_reported,

    drr17_indicators_future_to_be_achieved,

    drr17_past_total,
    drr17_future_total,
    drr17_total,
  };
}

// Used by copy_static_asset, node only supports commonjs syntax
module.exports = { compute_counts_from_set }