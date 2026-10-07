import _ from "lodash";

// seeking_to uses the same mapping as indicator_target_text:
// "max" is displayed as "At least" and is a minimum target (result should be >= target_min)
// "min" is displayed as "At most" and is a maximum target (result should be <= target_max)
const NUMERIC_TARGET_TYPES = [
  "num",
  "num_range",
  "dollar",
  "dollar_range",
  "percent",
  "percent_range",
];

const PLOTTABLE_STATUSES = ["met", "not_met"];

// Float noise from the percentage formula should still count as meeting the target.
const ZERO_EPSILON = 1e-6;

const short_bin = (id, show_axis_label) => ({
  id,
  label_key: `distance_bin_${id}`,
  tone: "short",
  show_axis_label,
});

const exceeded_bin = (id, show_axis_label) => ({
  id,
  label_key: `distance_bin_${id}`,
  tone: "exceeded",
  show_axis_label,
});

export const DISTANCE_BINS = [
  {
    id: "lte_neg_100",
    label_key: "distance_bin_lte_neg_100",
    tone: "short",
    overflow: true,
    show_axis_label: true,
  },
  short_bin("neg_90", false),
  short_bin("neg_80", true),
  short_bin("neg_70", false),
  short_bin("neg_60", true),
  short_bin("neg_50", false),
  short_bin("neg_40", true),
  short_bin("neg_30", false),
  short_bin("neg_20", true),
  short_bin("neg_10", false),
  {
    id: "met",
    label_key: "distance_bin_met",
    tone: "met",
    show_axis_label: true,
  },
  exceeded_bin("pos_10", false),
  exceeded_bin("pos_20", true),
  exceeded_bin("pos_30", false),
  exceeded_bin("pos_40", true),
  exceeded_bin("pos_50", false),
  exceeded_bin("pos_60", true),
  exceeded_bin("pos_70", false),
  exceeded_bin("pos_80", true),
  exceeded_bin("pos_90", false),
  {
    id: "gte_pos_100",
    label_key: "distance_bin_gte_pos_100",
    tone: "exceeded",
    overflow: true,
    show_axis_label: true,
  },
];

const is_numeric_target_type = (target_type) =>
  _.includes(NUMERIC_TARGET_TYPES, target_type);

const parse_finite_number = (value) => {
  if (_.isNil(value) || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const is_type_switch = (indicator) => {
  const previous_target_type = indicator.previous_year_target_type;
  if (_.isNil(previous_target_type) || previous_target_type === "") {
    return false;
  }
  return (
    is_numeric_target_type(indicator.target_type) !==
    is_numeric_target_type(previous_target_type)
  );
};

const snap_near_zero = (value) => (Math.abs(value) < ZERO_EPSILON ? 0 : value);

// Minimum target: meet when result >= target. Positive means the result beat the target.
const minimum_target_distance = (result, target) => {
  if (target === 0) {
    return result >= 0 ? 0 : "overflow_not_met";
  }
  return snap_near_zero(((result - target) / target) * 100);
};

// Maximum target: meet when result <= target. Positive means the result beat the target.
const maximum_target_distance = (result, target) => {
  if (target === 0) {
    return result <= 0 ? 0 : "overflow_not_met";
  }
  return snap_near_zero(((target - result) / target) * 100);
};

const range_distance = (result, min, max) => {
  if (min === 0 && max === 0) {
    return result === 0 ? 0 : "overflow_not_met";
  }
  if (result < min) {
    if (min === 0) {
      return "overflow_not_met";
    }
    return snap_near_zero(((result - min) / min) * 100);
  }
  if (result > max) {
    if (max === 0) {
      return "overflow_not_met";
    }
    return snap_near_zero(((max - result) / max) * 100);
  }
  return 0;
};

// Returns a percentage distance, "overflow_not_met" when the target is zero and
// the result missed it, or null when the indicator is left out of the chart.
export const indicator_distance = (indicator) => {
  if (
    is_type_switch(indicator) ||
    !is_numeric_target_type(indicator.target_type) ||
    !_.includes(PLOTTABLE_STATUSES, indicator.status_key)
  ) {
    return null;
  }

  const result = parse_finite_number(indicator.actual_result);
  if (result === null) {
    return null;
  }

  const target_min = parse_finite_number(indicator.target_min);
  const target_max = parse_finite_number(indicator.target_max);

  switch (indicator.seeking_to) {
    case "max":
      return target_min === null
        ? null
        : minimum_target_distance(result, target_min);
    case "min":
      return target_max === null
        ? null
        : maximum_target_distance(result, target_max);
    case "target": {
      if (target_min === null) {
        return null;
      }
      return range_distance(
        result,
        target_min,
        target_max === null ? target_min : target_max
      );
    }
    case "range":
      if (target_min === null || target_max === null) {
        return null;
      }
      return range_distance(result, target_min, target_max);
    default:
      return null;
  }
};

// 10-point bands. The −10% band continues up to, and does not include, zero.
// The +90% band continues up to, and does not include, +100%.
// ≤ −100% also holds results that missed a zero target and cannot be divided.
export const bin_for_distance = (distance) => {
  if (distance === "overflow_not_met" || distance <= -100) {
    return "lte_neg_100";
  }
  if (distance <= -90) {
    return "neg_90";
  }
  if (distance <= -80) {
    return "neg_80";
  }
  if (distance <= -70) {
    return "neg_70";
  }
  if (distance <= -60) {
    return "neg_60";
  }
  if (distance <= -50) {
    return "neg_50";
  }
  if (distance <= -40) {
    return "neg_40";
  }
  if (distance <= -30) {
    return "neg_30";
  }
  if (distance <= -20) {
    return "neg_20";
  }
  if (distance < 0) {
    return "neg_10";
  }
  if (distance === 0) {
    return "met";
  }
  if (distance <= 10) {
    return "pos_10";
  }
  if (distance <= 20) {
    return "pos_20";
  }
  if (distance <= 30) {
    return "pos_30";
  }
  if (distance <= 40) {
    return "pos_40";
  }
  if (distance <= 50) {
    return "pos_50";
  }
  if (distance <= 60) {
    return "pos_60";
  }
  if (distance <= 70) {
    return "pos_70";
  }
  if (distance <= 80) {
    return "pos_80";
  }
  if (distance < 100) {
    return "pos_90";
  }
  return "gte_pos_100";
};

const empty_bin_counts = () =>
  _.fromPairs(_.map(DISTANCE_BINS, ({ id }) => [id, 0]));

export const count_indicators_by_distance = (indicators) => {
  const counts = empty_bin_counts();
  let included_count = 0;

  _.forEach(indicators, (indicator) => {
    const distance = indicator_distance(indicator);
    if (!_.isNull(distance)) {
      counts[bin_for_distance(distance)] += 1;
      included_count += 1;
    }
  });

  return {
    counts,
    included_count,
    total_count: indicators.length,
  };
};

export const build_departmental_result_distance_chart = (indicators) => {
  const rows_by_cr = {};
  const cr_order = [];

  _.forEach(indicators, (indicator) => {
    const cr_id = indicator.parent_id || indicator.parent_name;
    if (!rows_by_cr[cr_id]) {
      rows_by_cr[cr_id] = {
        id: cr_id,
        name: indicator.parent_name,
        counts: empty_bin_counts(),
      };
      cr_order.push(cr_id);
    }

    const distance = indicator_distance(indicator);
    if (!_.isNull(distance)) {
      rows_by_cr[cr_id].counts[bin_for_distance(distance)] += 1;
    }
  });

  const rows = _.chain(cr_order)
    .map((cr_id) => rows_by_cr[cr_id])
    .filter((row) => _.sum(_.values(row.counts)) > 0)
    .value();

  const included_count = _.sumBy(rows, (row) => _.sum(_.values(row.counts)));

  return {
    rows,
    included_count,
    total_count: indicators.length,
  };
};

export const visible_distance_bins = (rows) =>
  _.filter(
    DISTANCE_BINS,
    (bin) => !bin.overflow || _.some(rows, (row) => row.counts[bin.id] > 0)
  );
