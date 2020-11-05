import _ from "lodash";

import { public_account_years_auth_exp } from "../constants";
import { get_standard_csv_file_rows } from "../load_utils.js";


export default function ({ models }) {
  const records = get_standard_csv_file_rows("transfer_payments.csv");

  _.each(records, (record) => {
    _.each(
      public_account_years_auth_exp,
      (col) => (record[col] = record[col] && parseFloat(record[col]))
    );
  });

  const { TransferPayments } = models;

  _.each(records, (rec) => TransferPayments.register(rec));
}
