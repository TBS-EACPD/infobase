import _ from "lodash";

import { estimates_years, public_account_years } from "../constants.js";

function flatten_pa_records(records) {
  return _.chain(records)
    .flatMap((record) =>
      _.map(public_account_years, (year) => ({
        year,
        auth: record[`${year}_auth`],
        exp: record[`${year}_exp`],
        ..._.pick(record, [
          "dept_code",
          "vote_num",
          "vs_type",
          "name_en",
          "name_fr",
        ]),
      }))
    )
    .value();
}

function flatten_estimates_records(records) {
  return _.chain(records)
    .flatMap((record) =>
      _.map(estimates_years, (year) => ({
        year,
        amount: record[year],
        ..._.pick(record, [
          "dept_code",
          "vote_num",
          "vs_type",
          "name_en",
          "name_fr",
          "doc",
        ]),
      }))
    )
    .value();
}

const program_years = _.takeRight(public_account_years, 2);
function flatten_program_records(records, years_to_include = program_years) {
  return _.chain(records)
    .flatMap((row) =>
      _.map(years_to_include, (year) => ({
        year,
        vs_type: row.vs_type,
        exp: row[year],
      }))
    )
    .compact("exp")
    .value();
}

export default function define_resource_models(model_singleton) {
  const _pa_spending_records_by_dept_code = {};
  class PAVoteStat {
    constructor(obj) {
      Object.assign(this, obj);
    }
    static register(obj) {
      const { dept_code } = obj;

      const inst = new PAVoteStat(obj);

      if (!_pa_spending_records_by_dept_code[dept_code]) {
        _pa_spending_records_by_dept_code[dept_code] = [];
      }
      _pa_spending_records_by_dept_code[dept_code].push(inst);
    }
    static get_dept_records(dept_code) {
      return _pa_spending_records_by_dept_code[dept_code] || [];
    }
    static get_flat_dept_records(dept_code) {
      return flatten_pa_records(this.get_dept_records(dept_code));
    }
  }

  const _estimates_spending_records_by_dept_code = {};
  class EstimatesVoteStat {
    constructor(obj) {
      Object.assign(this, obj);
    }
    static register(obj) {
      const { dept_code } = obj;

      const inst = new EstimatesVoteStat(obj);

      if (!_estimates_spending_records_by_dept_code[dept_code]) {
        _estimates_spending_records_by_dept_code[dept_code] = [];
      }
      _estimates_spending_records_by_dept_code[dept_code].push(inst);
    }
    static get_dept_records(dept_code) {
      return _estimates_spending_records_by_dept_code[dept_code] || [];
    }
    static get_flat_dept_records(dept_code) {
      return flatten_estimates_records(this.get_dept_records(dept_code));
    }
  }

  const _vote_stat_records_by_program_id = {};
  class ProgramVoteStat {
    constructor(obj) {
      Object.assign(this, obj);
    }
    static register(obj) {
      const { program_id } = obj;

      const inst = new ProgramVoteStat(obj);

      if (!_vote_stat_records_by_program_id[program_id]) {
        _vote_stat_records_by_program_id[program_id] = [];
      }
      _vote_stat_records_by_program_id[program_id].push(inst);
    }
    static get_flat_program_records(program_id, years) {
      return flatten_program_records(
        _vote_stat_records_by_program_id[program_id],
        years
      );
    }
  }

  model_singleton.define("PAVoteStat", PAVoteStat);
  model_singleton.define("EstimatesVoteStat", EstimatesVoteStat);
  model_singleton.define("ProgramVoteStat", ProgramVoteStat);
}
