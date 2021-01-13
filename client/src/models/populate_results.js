import { gql } from "@apollo/client";

import { lang } from "src/app_bootstrap/globals.js";
import _ from "lodash";

import { log_standard_event } from "../core/analytics.js";
import { get_client } from "../graphql_utils/graphql_utils.js";

import {
  Indicator,
  Result,
  PI_DR_Links,
  ResultCounts,
  GranularResultCounts,
  get_result_doc_keys,
} from "./results.js";

const result_doc_keys = get_result_doc_keys();

const has_results_query = (level, id_key) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    ${level}(${id_key}: $id) {
      id
      has_results
    }
  }
}
`;
const _subject_has_results = {}; // This is also populated as a side effect of api_load_results_bundle and api_load_results_counts calls
export const subject_has_results = (subject) => {
  const has_results_is_loaded = (() => {
    try {
      subject.has_data("results_data");
    } catch (error) {
      return false;
    }
    return true;
  })();

  if (has_results_is_loaded) {
    return Promise.resolve();
  } else {
    const { id } = subject;

    const level = subject.level === "dept" ? "org" : subject.level;

    if (
      !_.isUndefined(subject.is_internal_service) &&
      subject.is_internal_service
    ) {
      // opimization for internal services, they never have results
      subject.set_has_data("results_data", false);
      return Promise.resolve();
    } else if (!_.isUndefined(_subject_has_results[id])) {
      // case where _subject_has_results was populated by side effect but the subject.has_data status hasn't yet synced
      subject.set_has_data("results_data", _subject_has_results[id]);
      return Promise.resolve();
    } else {
      const time_at_request = Date.now();
      const client = get_client();

      const id_key = level === "org" ? "org_id" : "id";

      return client
        .query({
          query: has_results_query(level, id_key),
          variables: { lang: lang, id: id },
          _query_name: "has_results",
        })
        .then((response) => {
          const resp_time = Date.now() - time_at_request;

          const has_results = response && response.data.root[level].has_results;

          if (_.isBoolean(has_results)) {
            log_standard_event({
              SUBAPP: window.location.hash.replace("#", ""),
              MISC1: "API_QUERY_SUCCESS",
              MISC2: `Has results, took ${resp_time} ms`,
            });
          } else {
            log_standard_event({
              SUBAPP: window.location.hash.replace("#", ""),
              MISC1: "API_QUERY_UNEXPECTED",
              MISC2: `Has results, took ${resp_time} ms`,
            });
          }

          _subject_has_results[id] = has_results;
          subject.set_has_data("results_data", has_results);

          return Promise.resolve();
        })
        .catch(function (error) {
          const resp_time = Date.now() - time_at_request;
          log_standard_event({
            SUBAPP: window.location.hash.replace("#", ""),
            MISC1: "API_QUERY_FAILURE",
            MISC2: `Has results, took  ${resp_time} ms - ${error.toString()}`,
          });
          throw error;
        });
    }
  }
};

let _api_subject_ids_with_loaded_results = {};
const results_fields_fragment = (docs_to_load) =>
  _.chain(docs_to_load)
    .map(
      (doc) => `
${doc}_results: results(doc: "${doc}") {
  id
  stable_id
  parent_id
  name
  doc

  indicators {
    id
    stable_id
    result_id
    name
    doc

    target_year
    target_month

    target_type
    target_min
    target_max
    target_narrative
    measure
    seeking_to

    previous_year_target_type
    previous_year_target_min
    previous_year_target_max
    previous_year_target_narrative
    previous_year_measure
    previous_year_seeking_to

    target_explanation
    result_explanation

    actual_result
    
    status_key

    methodology
  }
}`
    )
    .reduce(
      (memo, fragment) => `
${memo}
${fragment}`
    )
    .value();
const program_results_fragment = (docs_to_load) => `
id
${results_fields_fragment(docs_to_load)}
pidrlinks {
  program_id
  result_id
}
`;
const crso_load_results_bundle_fragment = (docs_to_load) => `
id
${results_fields_fragment(docs_to_load)}
`;
const get_program_load_results_bundle_query = (docs_to_load) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    program(id: $id) {
      id
      ${program_results_fragment(docs_to_load)}
    }
  }
}
`;
const get_crso_load_results_bundle_query = (docs_to_load) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    crso(id: $id) {
      id
      ${crso_load_results_bundle_fragment(docs_to_load)}
      programs {
        ${program_results_fragment(docs_to_load)}
      }
    }
  }
}
`;
const get_dept_load_results_bundle_query = (docs_to_load) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      crsos {
        ${crso_load_results_bundle_fragment(docs_to_load)}
      }
      programs {
        ${program_results_fragment(docs_to_load)}
      }
    }
  }
}
`;
const get_all_load_results_bundle_query = (docs_to_load) => gql`
query($lang: String!) {
  root(lang: $lang) {
    orgs {
      id
      crsos {
        ${crso_load_results_bundle_fragment(docs_to_load)}
      }
      programs {
        ${program_results_fragment(docs_to_load)}
      }
    }
  }
}
`;

function extract_flat_data_from_results_hierarchies(
  hierarchical_response_data
) {
  const results = [],
    indicators = [],
    pi_dr_links = [];

  const parse_non_empty_int = (value) =>
    _.isEmpty(value) ? null : parseInt(value);

  const crawl_hierachy_level = (subject_node) =>
    _.each(subject_node, (subject) => {
      _.each(
        _.chain(subject)
          .pickBy((value, key) => /(drr|dp)[0-9][0-9]_results/.test(key))
          .reduce((memo, doc_results) => [...memo, ...doc_results], [])
          .value(),
        (result) => {
          results.push({
            id: result.id,
            subject_id: subject.id,
            name: result.name,
            doc: result.doc,
          });

          _.each(result.indicators, (indicator) => {
            const processed_indicator = {
              ...indicator,
              // methodologies are markdown, but many contain a line starting with an unescaped # that ISN'T a header, but an actuall number sign
              // a header in a methodology would be invalid Titan input anyway, so safe to escape all those cases ourselves
              methodology:
                indicator.methodology &&
                indicator.methodology.replace(/^#/g, "\\#"),
              target_year: parse_non_empty_int(indicator.target_year),
              target_month: parse_non_empty_int(indicator.target_month),
            };

            indicators.push(_.omit(processed_indicator, "__typename"));
          });
        }
      );

      if (!_.isEmpty(subject.pidrlinks)) {
        _.each(subject.pidrlinks, (pidrlink) => pi_dr_links.push(pidrlink));
      }
    });

  _.each(hierarchical_response_data, (response) => {
    switch (response.__typename) {
      case "Program":
        crawl_hierachy_level([response]);
        break;
      case "Crso":
        crawl_hierachy_level([response]);
        crawl_hierachy_level(response.programs);
        break;
      default:
        crawl_hierachy_level(response.crsos);
        crawl_hierachy_level(response.programs);
    }
  });

  return {
    results,
    indicators,
    pi_dr_links,
  };
}

export function api_load_results_bundle(subject, result_docs) {
  const docs_to_load = !_.isEmpty(result_docs) ? result_docs : result_doc_keys;

  const level = (subject && subject.level) || "all";

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.every(docs_to_load, (doc) =>
        _.get(_api_subject_ids_with_loaded_results, `${doc}.${level}.${id}`)
      );

    const all_is_loaded = () => subject_is_loaded({ level: "all", id: "all" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);
    const crso_is_loaded = (crso) =>
      dept_is_loaded(crso.dept) || subject_is_loaded(crso);
    const program_is_loaded = (program) =>
      crso_is_loaded(program.crso) || subject_is_loaded(program);

    switch (level) {
      case "program":
        return {
          is_loaded: program_is_loaded(subject),
          id: subject.id,
          query: get_program_load_results_bundle_query(docs_to_load),
          response_data_accessor: (response) => [response.data.root.program],
        };
      case "crso":
        return {
          is_loaded: crso_is_loaded(subject),
          id: subject.id,
          query: get_crso_load_results_bundle_query(docs_to_load),
          response_data_accessor: (response) => [response.data.root.crso],
        };
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: get_dept_load_results_bundle_query(docs_to_load),
          response_data_accessor: (response) => [response.data.root.org],
        };
      default:
        return {
          is_loaded: all_is_loaded(subject),
          id: "all",
          query: get_all_load_results_bundle_query(docs_to_load),
          response_data_accessor: (response) => response.data.root.orgs,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  const client = get_client();
  return client
    .query({
      query,
      variables: {
        lang: lang,
        id,
        _query_name: "results_bundle",
      },
    })
    .then((response) => {
      const hierarchical_response_data = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(hierarchical_response_data)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Results, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Results, took ${resp_time} ms`,
        });
      }

      const {
        results,
        indicators,
        pi_dr_links,
      } = extract_flat_data_from_results_hierarchies(
        hierarchical_response_data
      );

      _.each(results, (obj) => Result.create_and_register(obj));
      _.each(indicators, (obj) => Indicator.create_and_register(obj));
      _.each(pi_dr_links, ({ program_id, result_id }) =>
        PI_DR_Links.add(program_id, result_id)
      );

      _.each(
        docs_to_load,
        // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
        // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
        (doc) => {
          _.setWith(
            _api_subject_ids_with_loaded_results,
            `${doc}.${level}.${id}`,
            true,
            Object
          );

          // can't tell us if subject has no results for any doc, just if it has any for current doc, so only update the _subject_has_results entry if positive
          _subject_has_results[id] =
            !_.isEmpty(results) || _subject_has_results[id]; // side effect
        }
      );

      return Promise.resolve();
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Results, took  ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
}

let api_is_results_count_loaded = {
  summary: false,
  granular: false,
};
const load_results_counts_query = (level = "summary") => gql`
query($lang: String!) {
  root(lang: $lang) {
    gov {
      id
      all_target_counts_${level} {
        subject_id
        level
${
  // Weird indentation ahead, so that the template output has the right spacing
  _.chain(result_doc_keys)
    .map((doc_key) =>
      /drr/.test(doc_key)
        ? `
        ${doc_key}_results
        ${doc_key}_indicators_met
        ${doc_key}_indicators_not_available
        ${doc_key}_indicators_not_met
        ${doc_key}_indicators_future`
        : `
        ${doc_key}_results
        ${doc_key}_indicators`
    )
    .reduce(
      (memo, fragment) => `${memo}
${fragment}`
    )
    .value()
}
      }
    }
  }
}
`;
export function api_load_results_counts(level = "summary") {
  if (api_is_results_count_loaded[level]) {
    return Promise.resolve();
  } else {
    const time_at_request = Date.now();
    const client = get_client();
    return client
      .query({
        query: load_results_counts_query(level),
        variables: {
          lang: lang,
          _query_name: "results_counts",
        },
      })
      .then((response) => {
        const resp_time = Date.now() - time_at_request;

        const response_rows =
          response && response.data.root.gov[`all_target_counts_${level}`];

        if (!_.isEmpty(response_rows)) {
          // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
          log_standard_event({
            SUBAPP: window.location.hash.replace("#", ""),
            MISC1: "API_QUERY_SUCCESS",
            MISC2: `Results counts, took ${resp_time} ms`,
          });
        } else {
          log_standard_event({
            SUBAPP: window.location.hash.replace("#", ""),
            MISC1: "API_QUERY_UNEXPECTED",
            MISC2: `Results counts, took ${resp_time} ms`,
          });
        }

        const mapped_rows = _.map(response_rows, (row) => {
          const null_zeroed_row = _.mapValues(row, (value) =>
            _.isNull(value) ? 0 : value
          );

          const calculated_drr_counts = _.chain(get_result_doc_keys("drr"))
            .flatMap((doc_key) => [
              [
                `${doc_key}_past_total`,
                null_zeroed_row[`${doc_key}_indicators_met`] +
                  null_zeroed_row[`${doc_key}_indicators_not_met`] +
                  null_zeroed_row[`${doc_key}_indicators_not_available`],
              ],
              [
                `${doc_key}_future_total`,
                null_zeroed_row[`${doc_key}_indicators_future`],
              ],
              [
                `${doc_key}_total`,
                null_zeroed_row[`${doc_key}_indicators_met`] +
                  null_zeroed_row[`${doc_key}_indicators_not_met`] +
                  null_zeroed_row[`${doc_key}_indicators_not_available`] +
                  null_zeroed_row[`${doc_key}_indicators_future`],
              ],
            ])
            .fromPairs()
            .value();

          return {
            ...null_zeroed_row,
            id: null_zeroed_row.subject_id,
            ...calculated_drr_counts,
          };
        });

        if (level === "summary") {
          ResultCounts.set_data(mapped_rows);
        } else if (level === "granular") {
          GranularResultCounts.set_data(mapped_rows);
        }
        api_is_results_count_loaded[level] = true;

        // if it's in the results count set, it has results data
        _.each(mapped_rows, ({ id }) => (_subject_has_results[id] = true)); // side effect

        return Promise.resolve();
      })
      .catch(function (error) {
        const resp_time = Date.now() - time_at_request;
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_FAILURE",
          MISC2: `Results counts, took  ${resp_time} ms - ${error.toString()}`,
        });
        throw error;
      });
  }
}
