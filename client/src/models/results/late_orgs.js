/**
 * Centralized late-org detection and getters for DRR/DP banners and footnotes.
 * Auto-detects missing data when available; falls back to config (manual overrides).
 * temp_untabled_orgs remain manual and are not auto-detected.
 */

import _ from "lodash";

import { Dept } from "src/models/subjects";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { Table } from "src/tables/TableClass";

import {
  ResultCounts,
  result_docs,
  result_docs_in_tabling_order,
  get_result_doc_keys,
  LATE_ACTUAL_FTE_ORG_OVERRIDE,
} from "./results";

const EXEMPT_ORGS = ["151"];

const apply_exempt = (org_ids) => _.difference(org_ids, EXEMPT_ORGS);

// ---- Expected-dept helpers (single source of truth) ----

const get_expected_results_depts = () =>
  _.chain(Dept.store.get_all())
    .filter((d) => d.is_dp_org && !d.is_dead)
    .map("id")
    .value();

const get_expected_planned_resources_depts = () =>
  _.chain(Dept.store.get_all())
    .filter((d) => d.is_dp_org && d.has_planned_spending && !d.is_dead)
    .value();

// ---- Detection (internal): return [] when data not ready or on error ----

const detect_late_results_orgs = (doc_key) => {
  try {
    const expected = get_expected_results_depts();
    if (_.isEmpty(expected) || _.isEmpty(ResultCounts.data)) return [];

    const is_drr = /drr/.test(doc_key);
    const count_key = is_drr ? `${doc_key}_total` : `${doc_key}_indicators`;

    const late = _.filter(expected, (dept_id) => {
      const counts = ResultCounts.get_dept_counts(dept_id);
      if (!counts) return true;
      const v = counts[count_key];
      return _.isUndefined(v) || _.isNull(v) || v === 0;
    });
    return apply_exempt(late);
  } catch (e) {
    console.warn(`late_orgs: detect_late_results_orgs(${doc_key})`, e);
    return [];
  }
};

const detect_late_resources_orgs = () => {
  try {
    const expected = get_expected_planned_resources_depts();
    if (_.isEmpty(expected)) return [];

    const late = _.chain(expected)
      .filter((d) => !_.includes(d.table_ids, "programSpending"))
      .map("id")
      .value();
    return apply_exempt(late);
  } catch (e) {
    console.warn("late_orgs: detect_late_resources_orgs", e);
    return [];
  }
};

const detect_late_actual_fte_orgs = () => {
  try {
    const table =
      Table.store.has("programFtes") && Table.store.lookup("programFtes");
    if (!table || !table.data || _.isEmpty(table.data)) return [];

    const expected = get_expected_results_depts();
    if (_.isEmpty(expected)) return [];

    const year_col = _.last(year_templates.std_years);
    const late = _.filter(expected, (dept_id) => {
      const dept = Dept.store.lookup(dept_id);
      if (!dept) return true;
      const sum = table.q(dept).sum(year_col);
      return _.isUndefined(sum) || _.isNull(sum) || sum === 0;
    });
    return apply_exempt(late);
  } catch (e) {
    console.warn("late_orgs: detect_late_actual_fte_orgs", e);
    return [];
  }
};

const detect_late_planned_fte_orgs = () => {
  try {
    const table =
      Table.store.has("programFtes") && Table.store.lookup("programFtes");
    if (!table || !table.data || _.isEmpty(table.data)) return [];

    const expected = get_expected_planned_resources_depts();
    if (_.isEmpty(expected)) return [];

    const year_col = _.first(year_templates.planning_years);
    const late = _.filter(expected, (d) => {
      const sum = table.q(d).sum(year_col);
      return _.isUndefined(sum) || _.isNull(sum) || sum === 0;
    });
    return apply_exempt(_.map(late, "id"));
  } catch (e) {
    console.warn("late_orgs: detect_late_planned_fte_orgs", e);
    return [];
  }
};

// ---- Public getters: config first, then auto-detect for latest doc where applicable ----

const is_latest_doc = (doc_key) => {
  const order = result_docs_in_tabling_order;
  return order.length > 0 && order[order.length - 1].doc_key === doc_key;
};

const is_latest_dp_doc = (doc_key) => {
  const dp_keys = get_result_doc_keys("dp");
  return dp_keys.length > 0 && doc_key === _.last(dp_keys);
};

/** Late results (indicators) for a given doc. Uses config; for latest doc only, auto-detects when config is empty. */
export const get_late_results_orgs = (doc_key) => {
  const doc = result_docs[doc_key];
  if (!doc) return [];
  const config = doc.late_results_orgs || [];
  if (!is_latest_doc(doc_key)) return config;
  const detected = detect_late_results_orgs(doc_key);
  return detected.length > 0 ? detected : config;
};

/** Late planned spending/resources for the latest DP. Config first, then auto-detect. */
export const get_late_resources_orgs = (doc_key) => {
  const doc = result_docs[doc_key];
  if (!doc || !doc.is_dp) return [];
  const config = doc.late_resources_orgs || [];
  if (!is_latest_dp_doc(doc_key)) return config;
  const detected = detect_late_resources_orgs();
  return detected.length > 0 ? detected : config;
};

/** Late actual FTE (DRR). Override first, then auto-detect. */
export const get_late_actual_fte_orgs = () => {
  const detected = detect_late_actual_fte_orgs();
  if (detected.length > 0) return detected;
  return LATE_ACTUAL_FTE_ORG_OVERRIDE || [];
};

/** Late planned FTE for the latest DP. Config first, then auto-detect. */
export const get_late_planned_fte_orgs = () => {
  const dp_keys = get_result_doc_keys("dp");
  if (_.isEmpty(dp_keys)) return [];
  const latest_key = _.last(dp_keys);
  const doc = result_docs[latest_key];
  if (!doc || !doc.is_dp) return [];
  const config = doc.late_planned_fte_orgs || [];
  const detected = detect_late_planned_fte_orgs();
  return detected.length > 0 ? detected : config;
};

/** Late-dept count for DRR gov panel: late results + temp_untabled (manual only). */
export const get_late_dept_count_for_drr = (drr_key) => {
  const doc = result_docs[drr_key];
  if (!doc) return 0;
  const late_results = get_late_results_orgs(drr_key).length;
  const temp_untabled = (doc.temp_untabled_orgs || []).length;
  return late_results + temp_untabled;
};

/** Late-dept count for DP gov panel. */
export const get_late_dept_count_for_dp = (dp_key) =>
  get_late_results_orgs(dp_key).length;

/** Synthetic doc for pre-DRR late actual FTE footnotes (same shape as result_docs entries). */
export const get_pre_drr_late_fte_mock_doc = () => ({
  doc_type: "drr",
  year: run_template("{{pa_last_year}}"),
  late_results_orgs: [],
  late_resources_orgs: get_late_actual_fte_orgs(),
});
