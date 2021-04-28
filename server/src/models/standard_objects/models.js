import _ from "lodash";

import { public_account_years } from "../constants.js";

/* flattens out the years */

function flatten_so_records(records, years_to_include) {
  return _.chain(records)
    .flatMap((row) =>
      _.map(years_to_include, (year) => ({
        year,
        so_num: row.so_num,
        amount: row[year],
      }))
    )
    .compact("amount")
    .value();
}

function top_n_with_other(flat_data, year, n = 3) {
  const sorted_year_data = _.chain(flat_data)
    .filter({ year })
    .sortBy("amount")
    .reverse()
    .value();

  const top_n = _.take(sorted_year_data, n);
  const others = _.drop(sorted_year_data, n);

  return [
    ...top_n,
    {
      so_num: 0, //convention to mean 'other' sobjs
      amount: _.sumBy(others, "amount"),
      year,
    },
  ];
}

export default function (model_singleton) {
  const _org_records_by_dept_code = {};
  class OrgSobj {
    constructor(obj) {
      Object.assign(this, obj);
    }
    static register(obj) {
      const { dept_code } = obj;
      const inst = new OrgSobj(obj);

      if (!_org_records_by_dept_code[dept_code]) {
        _org_records_by_dept_code[dept_code] = [];
      }
      _org_records_by_dept_code[dept_code].push(inst);
    }
    static get_flat_records(dept_code) {
      const records = _org_records_by_dept_code[dept_code];
      return flatten_so_records(records, public_account_years);
    }
    static get_top_n_sobjs(dept_code, year, n) {
      return top_n_with_other(this.get_flat_records(dept_code), year, n);
    }
  }

  const _prog_records_by_program_id = {};
  class ProgSobj {
    constructor(obj) {
      Object.assign(this, obj);
    }
    static register(obj) {
      const { program_id } = obj;
      const inst = new ProgSobj(obj);

      if (!_prog_records_by_program_id[program_id]) {
        _prog_records_by_program_id[program_id] = [];
      }

      _prog_records_by_program_id[program_id].push(inst);
    }
    static get_flat_records(program_id) {
      const records = _prog_records_by_program_id[program_id];
      //we only provide the last 2 years for the program level sobjs
      return flatten_so_records(records, _.takeRight(public_account_years, 2));
    }
    static get_top_n_sobjs(program_id, year, n) {
      return top_n_with_other(this.get_flat_records(program_id), year, n);
    }
  }

  model_singleton.define("ProgSobj", ProgSobj);
  model_singleton.define("OrgSobj", OrgSobj);
}
