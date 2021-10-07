import _ from "lodash";

import { PanelRegistry, tables_for_panel } from "src/panels/PanelRegistry";

import {
  api_load_years_with_covid_data,
  api_load_all_covid_measures,
} from "src/models/covid/populate";
import { load_footnotes_bundle } from "src/models/footnotes/populate_footnotes";
import {
  api_load_results_bundle,
  api_load_results_counts,
  subject_has_results,
} from "src/models/populate_results";
import { api_load_has_services } from "src/models/populate_services";

import { assign_to_dev_helper_namespace } from "./assign_to_dev_helper_namespace";
import { Table } from "./TableClass";

const load_tables = (table_set) =>
  Promise.all(
    _.chain(table_set)
      .reject(_.property("loaded"))
      .map((table) => table.load())
      .value()
  );

function ensure_loaded({
  table_keys,
  panel_keys,
  subject_level,
  subject,
  has_results,
  results,
  result_docs,
  requires_result_counts,
  requires_granular_result_counts,
  has_services,
  has_covid_data,
  years_with_covid_data,
  covid_measures,
  footnotes_for: footnotes_subject,
}) {
  const table_set = _.chain(table_keys)
    .union(
      _.chain(panel_keys)
        .map((key) => tables_for_panel(key, subject_level))
        .flatten()
        .value()
    )
    .uniqBy()
    .map((table_key) => Table.store.lookup(table_key))
    .value();

  const panel_set = _.map(panel_keys, (key) =>
    PanelRegistry.lookup(key, subject_level)
  );

  const check_for_panel_dependency = (dependency_key) =>
    _.chain(panel_set).map(dependency_key).some().value();

  const should_load_results =
    results || check_for_panel_dependency("requires_results");

  const should_load_result_counts =
    requires_result_counts ||
    check_for_panel_dependency("requires_result_counts");

  const should_load_granular_result_counts =
    requires_granular_result_counts ||
    check_for_panel_dependency("requires_granular_result_counts");

  const should_load_years_with_covid_data =
    has_covid_data ||
    years_with_covid_data ||
    check_for_panel_dependency("requires_years_with_covid_data");

  const should_load_covid_measures =
    covid_measures || check_for_panel_dependency("requires_covid_measures");

  const result_docs_to_load = !_.isEmpty(result_docs)
    ? result_docs
    : _.chain(panel_set)
        .map("required_result_docs")
        .flatten()
        .uniq()
        .compact()
        .value();
  const results_prom = should_load_results
    ? api_load_results_bundle(subject, result_docs_to_load)
    : Promise.resolve();

  const result_counts_prom = should_load_result_counts
    ? api_load_results_counts("summary")
    : Promise.resolve();

  const has_results_prom =
    has_results && _.isFunction(subject.set_has_data)
      ? subject_has_results(subject)
      : Promise.resolve();

  const has_services_prom =
    has_services && _.isFunction(subject.set_has_data)
      ? api_load_has_services(subject)
      : Promise.resolve();

  const granular_result_counts_prom = should_load_granular_result_counts
    ? api_load_results_counts("granular")
    : Promise.resolve();

  const footnotes_prom = footnotes_subject
    ? load_footnotes_bundle(footnotes_subject)
    : Promise.resolve();

  const years_with_covid_data_prom = should_load_years_with_covid_data
    ? api_load_years_with_covid_data(subject)
    : Promise.resolve();

  const covid_measures_prom = should_load_covid_measures
    ? api_load_all_covid_measures()
    : Promise.resolve();

  return Promise.all([
    load_tables(table_set),
    results_prom,
    result_counts_prom,
    has_results_prom,
    has_services_prom,
    granular_result_counts_prom,
    footnotes_prom,
    years_with_covid_data_prom,
    covid_measures_prom,
  ]);
}

assign_to_dev_helper_namespace({ ensure_loaded });

export { ensure_loaded };
