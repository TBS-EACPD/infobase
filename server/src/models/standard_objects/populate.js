import _ from "lodash";

import { public_account_years } from "../constants.js";
import {
  get_standard_csv_file_rows,
  create_program_id,
} from "../load_utils.js";

export default function ({ models }) {
  const csv_prog_records = get_standard_csv_file_rows("program_sobjs.csv");
  const csv_org_records = get_standard_csv_file_rows("org_sobjs.csv");

  const prog_records = csv_prog_records.map((obj) =>
    _.assign({}, obj, {
      program_id: create_program_id(obj),
      so_num: +obj.so_num,
    })
  );

  const org_records = csv_org_records.map((obj) =>
    _.assign({}, obj, {
      so_num: +obj.so_num,
    })
  );

  _.each(org_records, (record) => {
    _.each(
      public_account_years,
      (col) => (record[col] = record[col] && parseFloat(record[col]))
    );
  });

  const prog_sobj_cols = _.takeRight(public_account_years, 2);
  _.each(prog_records, (record) => {
    _.each(
      prog_sobj_cols,
      (col) => (record[col] = record[col] && parseFloat(record[col]))
    );
  });

  const { OrgSobj, ProgSobj } = models;

  _.each(org_records, (rec) => OrgSobj.register(rec));
  _.each(prog_records, (rec) => ProgSobj.register(rec));
}
