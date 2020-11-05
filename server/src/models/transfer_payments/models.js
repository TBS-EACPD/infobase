import _ from "lodash";

import { public_account_years } from "../constants";

/* flattens out the years */

function flatten_records(records) {
  return _.chain(records)
    .flatMap((record) =>
      _.map(public_account_years, (year) => ({
        year,
        auth: record[`${year}_auth`],
        exp: record[`${year}_exp`],
        ..._.pick(record, ["dept_code", "type", "name_en", "name_fr"]),
      }))
    )
    .value();
}

function top_n_with_other(flat_data, year, n = 3) {
  const sorted_year_data = _.chain(flat_data)
    .filter({ year })
    .sortBy("exp")
    .reverse()
    .value();

  const top_n = _.take(sorted_year_data, n);
  const others = _.drop(sorted_year_data, n);

  return [
    ...top_n,
    {
      so_num: 0, //convention to mean 'other' sobjs
      exp: _.sumBy(others, "exp"),
      auth: _.sumBy(others, "auth"),
      year,
    },
  ];
}

export default function (model_singleton) {
  const _records_by_dept_code = {};
  class TransferPayments {
    constructor(obj) {
      Object.assign(this, obj);
    }
    static register(obj) {
      const { dept_code } = obj;
      const inst = new TransferPayments(obj);

      if (!_records_by_dept_code[dept_code]) {
        _records_by_dept_code[dept_code] = [];
      }
      _records_by_dept_code[dept_code].push(inst);
    }
    static get_flat_records(dept_code) {
      const records = _records_by_dept_code[dept_code];
      return flatten_records(records, public_account_years);
    }
    static get_top_n(dept_code, year, n) {
      return top_n_with_other(this.get_flat_records(dept_code), year, n);
    }
  }

  model_singleton.define("TransferPayments", TransferPayments);
}
