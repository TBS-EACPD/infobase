import {
  api_load_has_covid_response,
  api_load_covid_measures,
  api_load_covid_estimates_by_measure,
} from "../models/covid/populate.js";
import { load_footnotes_bundle } from "../models/footnotes/populate_footnotes.js";
import { load_horizontal_initiative_lookups } from "../models/populate_horizontal_initiative_lookups.js";
import {
  api_load_results_bundle,
  api_load_results_counts,
  subject_has_results,
} from "../models/populate_results.js";
import {
  api_load_subject_has_services,
  api_load_services,
} from "../models/populate_services.js";
import { PanelRegistry, tables_for_panel } from "../panels/PanelRegistry.js";

import { Table } from "./TableClass.js";

function load_tables(table_set) {
  return Promise.all(
    _.chain(table_set)
      .reject(_.property("loaded"))
      .map((table) => table.load())
      .value()
  );
}

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
  services,
  has_covid_response,
  covid_measures,
  covid_estimates,
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
    .map((table_key) => Table.lookup(table_key))
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

  const should_load_horizontal_initiative_lookups =
    subject &&
    subject.level === "tag" &&
    subject.root.id === "HI" &&
    _.isUndefined(subject.lookups);

  const should_load_has_services =
    has_services || check_for_panel_dependency("requires_has_services");

  const should_load_services =
    services || check_for_panel_dependency("requires_services");

  const should_load_has_covid_response =
    has_covid_response ||
    check_for_panel_dependency("requires_has_covid_response");

  const should_load_covid_measures =
    covid_measures || check_for_panel_dependency("requires_covid_measures");

  const should_load_covid_estimates =
    covid_estimates || check_for_panel_dependency("requires_covid_estimates");

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

  const granular_result_counts_prom = should_load_granular_result_counts
    ? api_load_results_counts("granular")
    : Promise.resolve();

  const footnotes_prom = footnotes_subject
    ? load_footnotes_bundle(footnotes_subject)
    : Promise.resolve();

  const has_services_prom =
    should_load_has_services && _.isFunction(subject.set_has_data)
      ? api_load_subject_has_services(subject)
      : Promise.resolve();

  const services_prom = should_load_services
    ? api_load_services(subject)
    : Promise.resolve();

  const horizontal_initiative_lookups_prom = should_load_horizontal_initiative_lookups
    ? load_horizontal_initiative_lookups()
    : Promise.resolve();

  const has_covid_response_prom = should_load_has_covid_response
    ? api_load_has_covid_response(subject)
    : Promise.resolve();

  const covid_measures_prom = should_load_covid_measures
    ? api_load_covid_measures()
    : Promise.resolve();

  const covid_estimates_prom = should_load_covid_estimates
    ? api_load_covid_estimates_by_measure(subject)
    : Promise.resolve();

  return Promise.all([
    load_tables(table_set),
    results_prom,
    result_counts_prom,
    has_results_prom,
    granular_result_counts_prom,
    footnotes_prom,
    has_services_prom,
    services_prom,
    horizontal_initiative_lookups_prom,
    has_covid_response_prom,
    covid_measures_prom,
    covid_estimates_prom,
  ]);
}

window._DEV_HELPERS.ensure_loaded = ensure_loaded;

export { ensure_loaded };
