import _ from "lodash";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace.js";
import { formats } from "src/core/format.js";
import { lang } from "src/core/injected_build_constants.js";

import { businessConstants } from "./businessConstants.js";
import { Program, CRSO } from "./organizational_entities.js";
import { trivial_text_maker, run_template } from "./text.js";

const { months } = businessConstants;
const { year_to_fiscal_year } = formats;

// dependencies are tangled up too much here, disable it for the whole file
/* eslint-disable no-use-before-define */

//currently only supports dept, crso, programs
function _get_flat_results(subject) {
  if (subject.is_fake) {
    return [];
  }
  switch (subject.level) {
    case "program":
      return _.chain(Result.get_entity_results(subject.id))
        .uniqBy("id")
        .compact()
        .value();

    case "crso":
      return _.chain(subject.programs)
        .map(_get_flat_results)
        .flatten()
        .concat(Result.get_entity_results(subject.id))
        .compact()
        .value();

    case "dept":
      return _.chain(subject.crsos)
        .map(_get_flat_results)
        .flatten()
        .compact()
        .value();

    default:
      return [];
  }
}

//critical assumption: ids are unique accross programs and CRs
//FIXME data issue:
// Note that Finance BLJ's programs will all share the same result,
//this makes it impossible
//and it introduces the potential of problem of double counting.
const entity_indexed_results = {};
const id_indexed_results = {};
class Result {
  static get_all() {
    return _.map(id_indexed_results, _.identity);
  }
  static lookup(id) {
    return id_indexed_results[id];
  }
  static get_entity_results(id) {
    return entity_indexed_results[id] || [];
  }
  static create_and_register(def) {
    const { id, subject_id, name } = def;

    //ignore anything too empty
    if (_.isEmpty(id) || _.isEmpty(subject_id) || _.isEmpty(name)) {
      return;
    }

    //if it already exists, ignore it
    if (id_indexed_results[id]) {
      return;
    }

    const inst = new Result(def);

    //keep structures in sync with what's loaded
    if (!entity_indexed_results[subject_id]) {
      entity_indexed_results[subject_id] = [];
    }
    entity_indexed_results[subject_id].push(inst);

    id_indexed_results[id] = inst;
  }
  static get_departmental_results(dept_obj) {
    return _.chain(dept_obj.crsos)
      .filter("is_cr")
      .map(({ id }) => Result.get_entity_results(id))
      .flatten()
      .filter("is_dr")
      .value();
  }
  constructor(fields) {
    Object.assign(this, fields);
  }
  get indicators() {
    return Indicator.lookup_by_result_id(this.id);
  }
  singular() {
    return trivial_text_maker("result");
  }
  plural() {
    return trivial_text_maker("results");
  }
  get level() {
    return "result";
  }
  get guid() {
    return `result_${this.id}`;
  }
  get subject() {
    const { subject_id } = this;
    let program = Program.lookup(subject_id);
    let crso = CRSO.lookup(subject_id);

    return program || crso;
  }
  get parent_level() {
    const subject = this.subject;
    if (subject.level === "crso") {
      return subject.is_cr ? "cr" : "so";
    } else {
      return subject.level;
    }
  }
  get is_dr() {
    return this.parent_level === "cr";
  }
  get contributing_programs() {
    return _.chain(PI_DR_Links.get_contributing_program_ids_for_result(this.id))
      .map((prog_id) => Program.lookup(prog_id))
      .compact()
      .value();
  }
  static get_flat_results(subject) {
    return _get_flat_results(subject);
  }
}

const result_indexed_indicators = {};
const id_indexed_indicators = {};
class Indicator {
  static get_all() {
    return _.map(id_indexed_indicators, _.identity);
  }
  static lookup(id) {
    return id_indexed_indicators[id];
  }
  static lookup_by_result_id(result_id) {
    return result_indexed_indicators[result_id] || [];
  }
  constructor(def) {
    Object.assign(this, def);
  }
  static create_and_register(def) {
    const { id, result_id } = def;

    if (this.lookup(id)) {
      return;
    }

    const inst = new Indicator(def);

    id_indexed_indicators[id] = inst;

    if (!result_indexed_indicators[result_id]) {
      result_indexed_indicators[result_id] = [];
    }
    result_indexed_indicators[result_id].push(inst);
  }
  get level() {
    return "indicator";
  }
  singular() {
    return trivial_text_maker("indicator");
  }
  plural() {
    return trivial_text_maker("indicators");
  }
  get guid() {
    return `indicator_${this.id}`;
  }
  get target_date() {
    const { target_month, target_year } = this;
    if (_.isNumber(target_month) && _.isNumber(target_year)) {
      return `${months[target_month].text} ${target_year}`;
    } else if (_.isNumber(target_year)) {
      return target_year;
    } else if (!_.isEmpty(target_year)) {
      return trivial_text_maker(target_year);
    } else {
      return trivial_text_maker("unspecified");
    }
  }
  static get_flat_indicators(subject) {
    return _.chain(Result.get_flat_results(subject))
      .map("indicators")
      .flatten()
      .compact()
      .uniqBy("id")
      .value();
  }
  //dont use this on multiple indicators, it'll be super slow!
  get _result() {
    return Result.lookup(this.result_id);
  }
}

//does not use storeMixins because it's a linkage table, there's no primary key
const links = [];
const id_indexed_links = {}; //IDs === <PI_ID>-<DR_ID>

const PI_DR_Links = {
  add(program_id, result_id) {
    const unique_id = `${program_id}-${result_id}`;
    if (!id_indexed_links[unique_id]) {
      const obj = { program_id, result_id };
      id_indexed_links[unique_id] = obj;
      links.push(obj);
    }
  },
  get_tagged_results_for_program(program_id) {
    return _.chain(links)
      .filter({ program_id })
      .map(({ result_id }) => Result.lookup(result_id))
      .compact()
      .value();
  },
  get_contributing_program_ids_for_result(result_id) {
    return _.chain(links).filter({ result_id }).map("program_id").value();
  },
  _all() {
    return links;
  }, //debugging purposes
};

//assumes ensure_loaded: requires_result_counts has been called
const results_counts_not_loaded_error =
  "result counts have not yet been loaded!";
const ResultCounts = {
  data: null,
  get_dept_counts(org_id) {
    if (_.isEmpty(this.data)) {
      throw results_counts_not_loaded_error;
    }
    return _.chain(this.data).find({ id: org_id.toString() }).value();
  },
  get_gov_counts() {
    if (_.isEmpty(this.data)) {
      throw results_counts_not_loaded_error;
    }
    return _.chain(this.data).find({ id: "total" }).value();
  },
  get_data() {
    if (_.isEmpty(this.data)) {
      throw results_counts_not_loaded_error;
    }
    return this.data;
  },
  set_data(data) {
    if (!_.isEmpty(this.data)) {
      throw "data has already been set";
    }
    this.data = data;
  },
  get_all_dept_counts() {
    return _.filter(this.data, { level: "dept" });
  },
};

//assumes ensure_loaded: requires_granular_result_counts has been called
const granular_results_counts_not_loaded_error =
  "granular result counts have not yet been loaded!";
const GranularResultCounts = {
  data: null,
  get_subject_counts(subject_id) {
    if (_.isEmpty(this.data)) {
      throw granular_results_counts_not_loaded_error;
    }
    return _.chain(this.data).find({ id: subject_id }).value();
  },
  get_data() {
    if (_.isEmpty(this.data)) {
      throw granular_results_counts_not_loaded_error;
    }
    return this.data;
  },
  set_data(data) {
    if (!_.isEmpty(this.data)) {
      throw "data has already been set";
    }
    this.data = data;
  },
};

const ordered_status_keys = ["met", "not_met", "not_available", "future"];
const status_key_to_glossary_key = {
  met: "RESULTS_MET",
  not_met: "RESULTS_NOT_MET",
  not_available: "RESULTS_NOT_AVAILABLE",
  future: "RESULTS_ONGOING",
};

const get_doc_name = (doc_type, year) => {
  if (doc_type === "dp" && lang === "en") {
    return `${run_template(year)} Departmental Plan`;
  }
  if (doc_type === "dp" && lang === "fr") {
    return `plan ministériel de ${run_template(year)}`;
  }
  if (doc_type === "drr" && lang === "en") {
    return `${run_template(year)} Departmental Results Report`;
  }
  if (doc_type === "drr" && lang === "fr") {
    return `rapport sur les résultats ministériels de ${run_template(year)}`;
  }
  throw "Error: document type should be 'dp' or 'drr' and lang should be 'en' or 'fr'";
};

const build_doc_info_objects = (doc_type, docs) =>
  _.chain(docs)
    .map((doc_properties, index) => {
      const { year_short, resource_years } = doc_properties;

      const is_drr = doc_type === "drr";

      const primary_resource_year = is_drr
        ? _.last(resource_years)
        : _.first(resource_years);

      return {
        doc_type,
        doc_key: `${doc_type}${year_short.substring(2)}`,
        year: year_to_fiscal_year(year_short),
        name: get_doc_name(doc_type, year_short),
        resource_years_written: _.map(resource_years, run_template),
        primary_resource_year,
        primary_resource_year_written:
          primary_resource_year && run_template(primary_resource_year),
        has_resources: !_.isEmpty(resource_years),
        could_have_previous: index > 0,
        ...doc_properties,
      };
    })
    .keyBy("doc_key")
    .value();

// for now, resource_years values will need to be updated manually as program_spending.csv, etc, roll forward
const drr_docs = build_doc_info_objects("drr", [
  {
    year_short: "2018",
    resource_years: ["{{pa_last_year_2}}"],
    doc_url_en:
      "https://www.canada.ca/en/treasury-board-secretariat/services/departmental-performance-reports/2018-19-departmental-results-reports.html",
    doc_url_fr:
      "https://www.canada.ca/fr/secretariat-conseil-tresor/services/rapports-ministeriels-rendement/rapport-resultats-ministeriels-2018-2019.html",
    late_results_orgs: [],
    late_resources_orgs: [],
  },
  {
    year_short: "2019",
    resource_years: ["{{pa_last_year}}"],
    doc_url_en:
      "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/reports-plans-priorities/2019-20-departmental-plans.html",
    doc_url_fr:
      "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/rapports-plans-priorites/plans-ministeriels-2019-2020.html",
    late_results_orgs: [],
    late_resources_orgs: [],
  },
]);
const dp_docs = build_doc_info_objects("dp", [
  {
    year_short: "2020",
    resource_years: [],
    doc_url_en:
      "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/reports-plans-priorities/2020-21-departmental-plans.html",
    doc_url_fr:
      "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/rapports-plans-priorites/plans-ministeriels-2020-2021.html",
    late_results_orgs: [],
    late_resources_orgs: [],
  },
  {
    year_short: "2021",
    resource_years: [
      "{{planning_year_1}}",
      "{{planning_year_2}}",
      "{{planning_year_3}}",
    ],
    doc_url_en: null, //DP_TODO
    doc_url_fr: null, //DP_TODO
    late_results_orgs: [125, 256], //DP_TODO
    late_resources_orgs: [],
  },
]);
const result_docs = {
  ...drr_docs,
  ...dp_docs,
};
const result_docs_in_tabling_order = _.chain(result_docs)
  .values()
  .sortBy(
    ({ doc_type, year_short }) =>
      doc_type === "drr"
        ? +year_short + 1.1 // DRRs are tabled a year behind, add 0.1 further to give priority over same year DPs
        : +year_short // DPs are tabled a year ahead
  )
  .value();

const get_result_doc_keys = (doc_type) =>
  _.chain([drr_docs, dp_docs])
    .map((docs) => _.chain(docs).keys().sortBy().value())
    .thru(([drr_doc_keys, dp_doc_keys]) => {
      switch (doc_type) {
        case "drr":
          return drr_doc_keys;
        case "dp":
          return dp_doc_keys;
        default:
          return [...drr_doc_keys, ...dp_doc_keys];
      }
    })
    .value();
const current_drr_key = _.last(get_result_doc_keys("drr"));
const current_dp_key = _.last(get_result_doc_keys("dp"));

export {
  Result,
  Indicator,
  PI_DR_Links,
  ResultCounts,
  GranularResultCounts,
  status_key_to_glossary_key,
  ordered_status_keys,
  result_docs,
  result_docs_in_tabling_order,
  get_result_doc_keys,
  current_drr_key,
  current_dp_key,
};

assign_to_dev_helper_namespace({
  results_subjects: {
    Result,
    Indicator,
    PI_DR_Links,
    ResultCounts,
    GranularResultCounts,
  },
});
