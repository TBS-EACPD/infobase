import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

import {
  time_period_ordered_doc_keys,
  drr_docs,
  dp_docs,
} from "./results_common.js";

const doc_keys = [...drr_docs, ...dp_docs];
const valid_doc_filter = ({ doc }) => _.includes(doc_keys, doc);

const counts_from_indicators = (indicators) =>
  _.chain(indicators)
    .map(({ doc, result_id, status_key }) => ({
      [`${doc}_results`]: result_id,
      [`${doc}_indicators${status_key === "dp" ? "" : `_${status_key}`}`]: 1,
    }))
    .thru((indicator_count_fragments) => {
      const count_keys = _.chain(indicator_count_fragments)
        .flatMap(_.keys)
        .uniq()
        .value();

      return _.chain(indicator_count_fragments)
        .reduce(
          (memo, count_fragment) => {
            _.each(count_fragment, (value, key) =>
              _.isArray(memo[key]) ? memo[key].push(value) : memo[key]++
            );
            return memo;
          },
          _.chain(count_keys)
            .map((key) => (_.endsWith(key, "_results") ? [key, []] : [key, 0]))
            .fromPairs()
            .value()
        )
        .mapValues((value) => (_.isArray(value) ? _.uniq(value).length : value))
        .value();
    })
    .value();

const dr_counts_from_indicators = (indicators) => {
  const dr_indicators = _.filter(indicators, ({ result_id }) =>
    _.startsWith(result_id, "DR")
  );

  return _.chain(dr_indicators)
    .map(({ doc, result_id, status_key }) => ({
      [`${doc}_results`]: result_id,
      [`${doc}_indicators${status_key === "dp" ? "" : `_${status_key}`}`]: 1,
    }))
    .thru((indicator_count_fragments) => {
      //console.log(indicator_count_fragments);
      const count_keys = _.chain(indicator_count_fragments)
        .flatMap(_.keys)
        .uniq()
        .value();

      return _.chain(indicator_count_fragments)
        .reduce(
          (memo, count_fragment) => {
            _.each(count_fragment, (value, key) => {
              return _.isArray(memo[key]) ? memo[key].push(value) : memo[key]++;
            });
            return memo;
          },
          _.chain(count_keys)
            .map((key) => (_.endsWith(key, "_results") ? [key, []] : [key, 0]))
            .fromPairs()
            .value()
        )
        .mapValues((value) => (_.isArray(value) ? _.uniq(value).length : value))
        .value();
    })
    .value();
};

const get_result_count_records = (results, indicators) => {
  const indicators_by_result_id = _.groupBy(indicators, "result_id");

  const gov_row = {
    subject_id: "total",
    level: "all",
    ...dr_counts_from_indicators(indicators),
  };

  const igoc_rows = get_standard_csv_file_rows("igoc.csv");
  const dept_rows = _.chain(results)
    .groupBy(({ subject_id }) => _.split(subject_id, "-")[0])
    .mapValues((results) =>
      _.flatMap(results, ({ result_id }) => indicators_by_result_id[result_id])
    )
    .map((indicators, dept_code) => ({
      subject_id: _.find(
        igoc_rows,
        (igoc_row) => igoc_row.dept_code === dept_code
      ).org_id,
      level: "dept",
      ...counts_from_indicators(indicators),
    }))
    .value();

  const crso_or_prog_rows = _.chain(results)
    .groupBy("subject_id")
    .mapValues((results) =>
      _.flatMap(results, ({ result_id }) => indicators_by_result_id[result_id])
    )
    .map((indicators, subject_id) => ({
      subject_id,
      level: "crso_or_program",
      ...counts_from_indicators(indicators),
    }))
    .value();

  return [gov_row, ...dept_rows, ...crso_or_prog_rows];
};

export default async function ({ models }) {
  const { Result, ResultCount, Indicator, PIDRLink } = models;

  const raw_result_records = get_standard_csv_file_rows("results.csv");

  const raw_indicator_records = get_standard_csv_file_rows("indicators.csv");

  const pi_dr_links = get_standard_csv_file_rows("pi_dr_links.csv");

  const results_with_indicators = _.chain(raw_indicator_records)
    .map("result_id")
    .uniq()
    .value();

  const result_records = _.chain(raw_result_records)
    .map((result) => ({
      ...result,
      id: null,
      result_id: result.id,
    }))
    .filter(valid_doc_filter)
    .filter(({ result_id }) => _.includes(results_with_indicators, result_id)) // results without indicators are a data issue. The pipeline tracks these cases, so we can quietly discard them here
    .value();

  const parsed_int_or_null = (numeric_string) =>
    _.isNaN(parseInt(numeric_string)) ? null : parseInt(numeric_string);

  const indicator_records = _.chain(raw_indicator_records)
    .map((indicator) => ({
      ...indicator,
      id: null,
      indicator_id: indicator.id,
      target_year: parsed_int_or_null(indicator.target_year),
      target_month: parsed_int_or_null(indicator.target_month),
      status_key: indicator.status_key || "dp",
      gba_plus: indicator?.gba_plus || null,
      // methodologies are markdown, but when input in Titan the users specifically do not expect leading #'s to result in headers (and we don't
      // want them to either). Escape them so they can display regular number signs, as expected
      ..._.chain(["en", "fr"])
        .map((lang) => `methodology_${lang}`)
        .map((key) => [key, indicator[key]?.replace(/^#/gm, "\\#")])
        .fromPairs()
        .value(),
    }))
    .map((indicator, ix, indicator_records) => {
      const { doc, stable_id } = indicator;

      const doc_index = _.indexOf(time_period_ordered_doc_keys, doc);
      if (doc_index > 0) {
        // Look for corresponding indicator, by stable_id, from the previous documents. Pick most recent previous version
        const previous_year_indicator_instance = _.find(
          indicator_records,
          (indicator) =>
            indicator.stable_id === stable_id &&
            indicator.doc === time_period_ordered_doc_keys[doc_index - 1]
        );

        if (!_.isUndefined(previous_year_indicator_instance)) {
          return {
            ...indicator,
            ..._.chain([
              "target_type",
              "target_min",
              "target_max",
              "seeking_to",
              "target_change",
              "gba_plus",
            ])
              .map((field_key) => [
                `previous_year_${field_key}`,
                previous_year_indicator_instance[`${field_key}`],
              ])
              .fromPairs()
              .value(),
            ..._.chain(["target_narrative", "measure", "actual_result"])
              .flatMap((billingual_field_key) => [
                [
                  `previous_year_${billingual_field_key}_en`,
                  previous_year_indicator_instance[
                    `${billingual_field_key}_en`
                  ],
                ],
                [
                  `previous_year_${billingual_field_key}_fr`,
                  previous_year_indicator_instance[
                    `${billingual_field_key}_fr`
                  ],
                ],
              ])
              .fromPairs()
              .value(),
          };
        }
      }

      // fall through for new indicators
      return indicator;
    })
    .filter(valid_doc_filter)
    .value();

  const result_count_records = get_result_count_records(
    result_records,
    indicator_records
  );

  await Result.insertMany(result_records);
  await ResultCount.insertMany(result_count_records);
  await Indicator.insertMany(indicator_records);
  return await PIDRLink.insertMany(pi_dr_links);
}
