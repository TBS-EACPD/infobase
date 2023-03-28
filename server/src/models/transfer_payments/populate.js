import _ from "lodash";

import { public_account_years_auth_exp } from "../constants.js";
import { get_standard_csv_file_rows } from "../load_utils.js";

export default function ({ models }) {
  const records = get_standard_csv_file_rows("transfer_payments.csv");

  _.forEach(records, (record) => {
    _.forEach(
      public_account_years_auth_exp,
      (col) => (record[col] = record[col] && parseFloat(record[col]))
    );
  });

  const { TransferPayments } = models;

  _.forEach(records, (rec) => TransferPayments.register(rec));
}
