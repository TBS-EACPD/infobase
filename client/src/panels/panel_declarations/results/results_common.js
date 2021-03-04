import { scaleOrdinal } from "d3-scale";
import _ from "lodash";

import { get_resources_for_subject } from "src/explorer_common/resource_explorer_common.js";
import {
  Results,
  infograph_href_template,
  businessConstants,
  formats,
  newIBCategoryColors,
} from "../shared.js";

import { text_maker } from "./result_text_provider.js";

const {
  Result,
  Indicator,
  ResultCounts,
  GranularResultCounts,
  status_key_to_glossary_key,
  ordered_status_keys,
  result_docs,
  result_docs_in_tabling_order,
  get_result_doc_keys,
  current_drr_key,
  current_dp_key,
} = Results;

const { result_statuses, result_simple_statuses } = businessConstants;

const link_to_results_infograph = (subject) =>
  infograph_href_template(subject, "results");

const results_resource_fragment = (subject, doc) => {
  const doc_resource_year = result_docs[doc].primary_resource_year;

  if (doc_resource_year) {
    return get_resources_for_subject(subject, doc_resource_year);
  } else {
    return {
      spending: false,
      ftes: false,
    };
  }
};

const isDeptWithoutResults = (subject) =>
  _.chain(subject.programs)
    .map((prog) => _.isEmpty(Result.get_entity_results(prog.id)))
    .every()
    .value();

const row_to_drr_status_counts = (counts_row, drr_key) =>
  _.chain(ordered_status_keys)
    .map((status_key) => [
      status_key,
      counts_row[`${drr_key}_indicators_${status_key}`],
    ])
    .fromPairs()
    .value();

const type_by_data_type = {
  num: "result_num",
  num_range: "result_num",
  dollar: "dollar_raw",
  dollar_range: "dollar_raw",
  percent: "result_percentage",
  percent_range: "result_percentage",
};

const measure_display = (measure) =>
  !_.isEmpty(measure) ? ` (${measure})` : "";

const indicator_target_text = (indicator) => {
  const target_unspecified_display = text_maker("unspecified_target");

  const get_display_case = ({
    target_type,
    target_min,
    target_max,
    target_narrative,
    measure,
    seeking_to,
  }) => {
    // target_types of ..._range are a hold over from old data, in the future there will only be num, dollar, etc. and and the seeking_to value will indicate if it is a range or not
    switch (target_type) {
      case "num":
      case "num_range":
      case "dollar":
      case "dollar_range":
      case "percent":
      case "percent_range": {
        if (_.isNull(target_min) && _.isNull(target_max)) {
          // the case where target_type and seeking_to are set but no target exists shouldn't happen anymore, but exists in 2018-19 DPs
          return target_unspecified_display;
        }
        switch (seeking_to) {
          case "target":
            return `${text_maker("result_exact_text")} ${formats[
              type_by_data_type[target_type]
            ](+target_min)}${measure_display(measure)}`;
          case "min":
            return `${text_maker("result_upper_target_text")} ${formats[
              type_by_data_type[target_type]
            ](+target_max)}${measure_display(measure)}`;
          case "max":
            return `${text_maker("result_lower_target_text")} ${formats[
              type_by_data_type[target_type]
            ](+target_min)}${measure_display(measure)}`;
          case "range":
            return `${text_maker("result_range_text")} ${formats[
              type_by_data_type[target_type]
            ](+target_min)} ${text_maker("and")} ${formats[
              type_by_data_type[target_type]
            ](+target_max)}${measure_display(measure)}`;
          default:
            return target_unspecified_display;
        }
      }

      case "text": {
        return _.isEmpty(target_narrative)
          ? target_unspecified_display
          : target_narrative;
      }

      case "tbd": {
        return text_maker("tbd_result_text");
      }

      default: {
        return target_unspecified_display;
      }
    }
  };

  return get_display_case(indicator);
};

const indicator_previous_target_text = (indicator) => {
  const fake_previous = {
    target_type: indicator.previous_year_target_type,
    target_min: indicator.previous_year_target_min,
    target_max: indicator.previous_year_target_max,
    target_narrative: indicator.previous_year_target_narrative,
    measure: indicator.previous_year_measure,
    seeking_to: indicator.previous_year_seeking_to,
  };
  return indicator_target_text(fake_previous);
};

const indicator_actual_text = (indicator) => {
  const { target_type, actual_result, measure } = indicator;

  const result_unspecified_display = text_maker("unspecified");

  const get_display_case = (datatype, actual, measure) => {
    switch (datatype) {
      case "num":
      case "num_range":
      case "dollar":
      case "dollar_range":
      case "percent":
      case "percent_range": {
        return actual
          ? formats[type_by_data_type[datatype]](+actual) +
              measure_display(measure)
          : result_unspecified_display;
      }
      case "tbd": // TODO tbd's are rare, and mostly have blank actual vales... but they CAN have actual values (in which case we have no idea how to format them ATM, as the type is just TBD), so just displaying them raw for now. Data model needs to adjust to account for them
      case "text": {
        return _.isEmpty(actual) ? result_unspecified_display : actual;
      }
      default: {
        return result_unspecified_display;
      }
    }
  };

  return get_display_case(target_type, actual_result, measure);
};

const indicator_previous_actual_text = (indicator) => {
  const fake_previous = {
    target_type: indicator.previous_target_type,
    actual_result: indicator.previous_actual_result,
    measure: indicator.previous_measure,
  };
  return indicator_actual_text(fake_previous);
};

const indicator_text_functions = {
  indicator_target_text,
  indicator_actual_text,
  indicator_previous_target_text,
  indicator_previous_actual_text,
};

const filter_and_genericize_doc_counts = (counts, doc_key) => {
  const doc_type = /drr/.test(doc_key) ? "drr" : "dp";

  const count_key_regexp = new RegExp(`^${doc_key}`);

  const doc_counts_with_generic_keys = _.chain(counts)
    .pickBy((value, key) => count_key_regexp.test(key))
    .mapKeys((value, key) => key.replace(count_key_regexp, doc_type))
    .value();

  return doc_counts_with_generic_keys;
};

const result_color_scale = scaleOrdinal() // this is a d3 scale to allow seamless slotting into a nivo graph
  .domain(["met", "not_met", "not_available", "future"])
  .range(_.take(newIBCategoryColors, 4));

export {
  Result,
  Indicator,
  ResultCounts,
  GranularResultCounts,
  status_key_to_glossary_key,
  ordered_status_keys,
  result_docs,
  result_docs_in_tabling_order,
  get_result_doc_keys,
  current_drr_key,
  current_dp_key,
  results_resource_fragment,
  link_to_results_infograph,
  isDeptWithoutResults,
  row_to_drr_status_counts,
  result_statuses,
  result_simple_statuses,
  indicator_text_functions,
  result_color_scale,
  filter_and_genericize_doc_counts,
};
